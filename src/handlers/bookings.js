const { getText } = require('../locales');
const { User, Booking, Cotization, Service } = require('../models');
const { formatDate, generateTimeSlots, generateCalendar } = require('../utils/helpers');
const moment = require('moment-timezone');
const logger = require('../utils/logger');

// Store user booking state
const bookingStates = new Map();

async function showMyBookings(bot, chatId, language) {
  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });

    const bookings = await Booking.findAll({
      where: { userId: user.id },
      include: [
        { model: Cotization, include: [{ model: Service }] },
        { model: Service }
      ],
      order: [['date', 'DESC'], ['time', 'DESC']]
    });

    if (bookings.length === 0) {
      await bot.sendMessage(chatId, getText(language, 'no_bookings'), {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(language, 'menu_quote'), callback_data: 'menu:quote' }],
            [{ text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }]
          ]
        }
      });
      return;
    }

    const keyboard = bookings.map(booking => {
      const service = booking.Service || booking.Cotization?.Service;
      const serviceName = service ? service.name : 'Servicio personalizado';
      const dateStr = formatDate(booking.date);
      const status = getText(language, `status_${booking.status}`);

      return [{
        text: `${serviceName} - ${dateStr} ${booking.time} (${status})`,
        callback_data: `booking:${booking.id}`
      }];
    });

    keyboard.push([
      { text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }
    ]);

    await bot.sendMessage(chatId, getText(language, 'my_bookings'), {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showMyBookings:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function startBooking(bot, query, quoteId) {
  const chatId = query.message.chat.id;

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const quote = await Cotization.findByPk(quoteId);

    if (!quote || quote.userId !== user.id || quote.status !== 'accepted') {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_no_active_quote'),
        show_alert: true
      });
      return;
    }

    await bot.answerCallbackQuery(query.id);

    bookingStates.set(chatId, { quoteId: quoteId, step: 'date' });

    // Show calendar for current month
    const now = moment();
    const calendar = generateCalendar(now.year(), now.month() + 1);

    await bot.sendMessage(chatId, getText(user.language, 'booking_request'), {
      reply_markup: {
        inline_keyboard: calendar
      }
    });

  } catch (error) {
    logger.error('Error in startBooking:', error);
  }
}

async function handleCalendarNavigation(bot, query) {
  const chatId = query.message.chat.id;
  const [_, year, month] = query.data.split(':').map(Number);

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });

    // Handle month navigation
    let targetYear = year;
    let targetMonth = month;

    if (targetMonth < 1) {
      targetMonth = 12;
      targetYear--;
    } else if (targetMonth > 12) {
      targetMonth = 1;
      targetYear++;
    }

    const calendar = generateCalendar(targetYear, targetMonth);

    await bot.editMessageReplyMarkup(
      { inline_keyboard: calendar },
      {
        chat_id: chatId,
        message_id: query.message.message_id
      }
    );

    await bot.answerCallbackQuery(query.id);

  } catch (error) {
    logger.error('Error in handleCalendarNavigation:', error);
  }
}

async function handleDateSelection(bot, query) {
  const chatId = query.message.chat.id;
  const date = query.data.split(':')[1];

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const state = bookingStates.get(chatId);

    if (!state) {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_generic'),
        show_alert: true
      });
      return;
    }

    state.date = date;
    state.step = 'time';
    bookingStates.set(chatId, state);

    await bot.answerCallbackQuery(query.id);

    // Generate available time slots
    const timeSlots = generateTimeSlots();
    const keyboard = [];

    for (let i = 0; i < timeSlots.length; i += 2) {
      const row = [
        { text: timeSlots[i], callback_data: `time:${timeSlots[i]}` }
      ];
      if (i + 1 < timeSlots.length) {
        row.push({ text: timeSlots[i + 1], callback_data: `time:${timeSlots[i + 1]}` });
      }
      keyboard.push(row);
    }

    keyboard.push([
      { text: getText(user.language, 'back'), callback_data: 'menu:bookings' }
    ]);

    await bot.sendMessage(
      chatId,
      `${getText(user.language, 'select_time')}\n\n📅 ${formatDate(date)}`,
      {
        reply_markup: {
          inline_keyboard: keyboard
        }
      }
    );

  } catch (error) {
    logger.error('Error in handleDateSelection:', error);
  }
}

async function handleTimeSelection(bot, query) {
  const chatId = query.message.chat.id;
  const time = query.data.split(':')[1];

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const state = bookingStates.get(chatId);

    if (!state || !state.date) {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_generic'),
        show_alert: true
      });
      return;
    }

    // Check if time slot is available
    const existingBooking = await Booking.findOne({
      where: {
        date: state.date,
        time: time,
        status: ['pending', 'confirmed']
      }
    });

    if (existingBooking) {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_booking_conflict'),
        show_alert: true
      });
      return;
    }

    // Get quote details
    const quote = await Cotization.findByPk(state.quoteId, {
      include: [{ model: Service }]
    });

    // Create booking
    const booking = await Booking.create({
      userId: user.id,
      cotizationId: quote.id,
      serviceId: quote.serviceId,
      date: state.date,
      time: time,
      status: 'pending'
    });

    bookingStates.delete(chatId);

    await bot.answerCallbackQuery(query.id);

    await bot.sendMessage(
      chatId,
      getText(user.language, 'booking_created', {
        date: formatDate(state.date),
        time: time
      }),
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(user.language, 'back_to_menu'), callback_data: 'back:menu' }]
          ]
        }
      }
    );

    // Notify admins
    await notifyAdminsNewBooking(bot, user, booking, quote);

  } catch (error) {
    logger.error('Error in handleTimeSelection:', error);
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    await bot.sendMessage(chatId, getText(user?.language || 'es', 'error_generic'));
  }
}

async function showBookingDetails(bot, query) {
  const chatId = query.message.chat.id;
  const bookingId = query.data.split(':')[1];

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: Cotization, include: [{ model: Service }] },
        { model: Service }
      ]
    });

    if (!booking || booking.userId !== user.id) {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_generic'),
        show_alert: true
      });
      return;
    }

    await bot.answerCallbackQuery(query.id);

    const service = booking.Service || booking.Cotization?.Service;
    const serviceName = service ? service.name : 'Servicio personalizado';

    const bookingText =
      `📅 ${serviceName}\n\n` +
      `📆 Fecha: ${formatDate(booking.date)}\n` +
      `⏰ Hora: ${booking.time}\n` +
      `📊 ${getText(user.language, 'booking_status', {
        status: getText(user.language, `status_${booking.status}`)
      })}`;

    const keyboard = [];

    if (booking.status === 'pending') {
      keyboard.push([
        { text: getText(user.language, 'cancel_booking'), callback_data: `booking_action:${booking.id}:cancel` }
      ]);
    }

    keyboard.push([
      { text: getText(user.language, 'back'), callback_data: 'menu:bookings' }
    ]);

    await bot.sendMessage(chatId, bookingText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showBookingDetails:', error);
  }
}

async function handleBookingAction(bot, query) {
  const chatId = query.message.chat.id;
  const [_, bookingId, action] = query.data.split(':');

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const booking = await Booking.findByPk(bookingId);

    if (!booking || booking.userId !== user.id) {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_generic'),
        show_alert: true
      });
      return;
    }

    if (action === 'cancel') {
      booking.status = 'cancelled';
      await booking.save();

      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, getText(user.language, 'booking_cancelled'), {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(user.language, 'back_to_menu'), callback_data: 'back:menu' }]
          ]
        }
      });
    }

  } catch (error) {
    logger.error('Error in handleBookingAction:', error);
    await bot.answerCallbackQuery(query.id, {
      text: getText(user.language, 'error_generic'),
      show_alert: true
    });
  }
}

async function notifyAdminsNewBooking(bot, user, booking, quote) {
  const adminIds = (process.env.ADMIN_CHAT_IDS || '').split(',').map(id => id.trim());

  for (const adminId of adminIds) {
    try {
      await bot.sendMessage(adminId,
        `🔔 Nueva reserva\n\n` +
        `Usuario: ${user.chatId}\n` +
        `Fecha: ${formatDate(booking.date)}\n` +
        `Hora: ${booking.time}\n` +
        `Servicio: ${quote.details}\n\n` +
        `Usa el panel de admin para gestionar.`
      );
    } catch (error) {
      logger.error(`Error notifying admin ${adminId}:`, error);
    }
  }
}

module.exports = {
  showMyBookings,
  startBooking,
  handleCalendarNavigation,
  handleDateSelection,
  handleTimeSelection,
  showBookingDetails,
  handleBookingAction,
};
