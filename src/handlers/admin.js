const { getText } = require('../locales');
const { User, Cotization, Booking, Service } = require('../models');
const { isAdmin, formatCurrency, formatDate } = require('../utils/helpers');
const logger = require('../utils/logger');

// Store admin states
const adminStates = new Map();

async function showAdminPanel(bot, chatId, language) {
  if (!isAdmin(chatId)) {
    await bot.sendMessage(chatId, getText(language, 'error_admin_only'));
    return;
  }

  try {
    await bot.sendMessage(chatId, getText(language, 'admin_panel'), {
      reply_markup: {
        inline_keyboard: [
          [
            { text: getText(language, 'admin_quotes'), callback_data: 'admin:quotes' },
            { text: getText(language, 'admin_bookings'), callback_data: 'admin:bookings' }
          ],
          [
            { text: getText(language, 'admin_services'), callback_data: 'admin:services' },
            { text: getText(language, 'admin_stats'), callback_data: 'admin:stats' }
          ],
          [
            { text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }
          ]
        ]
      }
    });
  } catch (error) {
    logger.error('Error in showAdminPanel:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function handleAdminAction(bot, query) {
  const chatId = query.message.chat.id;
  const action = query.data.split(':')[1];

  if (!isAdmin(chatId)) {
    await bot.answerCallbackQuery(query.id, {
      text: 'Unauthorized',
      show_alert: true
    });
    return;
  }

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    await bot.answerCallbackQuery(query.id);

    switch (action) {
      case 'quotes':
        await showPendingQuotes(bot, chatId, user.language);
        break;

      case 'bookings':
        await showPendingBookings(bot, chatId, user.language);
        break;

      case 'services':
        await showServiceManagement(bot, chatId, user.language);
        break;

      case 'stats':
        await showStatistics(bot, chatId, user.language);
        break;
    }

  } catch (error) {
    logger.error('Error in handleAdminAction:', error);
  }
}

async function showPendingQuotes(bot, chatId, language) {
  try {
    const quotes = await Cotization.findAll({
      where: { status: 'pending' },
      include: [
        { model: User },
        { model: Service }
      ],
      order: [['createdAt', 'DESC']],
      limit: 10
    });

    if (quotes.length === 0) {
      await bot.sendMessage(chatId, 'No hay cotizaciones pendientes.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(language, 'back'), callback_data: 'menu:admin' }]
          ]
        }
      });
      return;
    }

    const keyboard = quotes.map(quote => {
      const userName = quote.User.chatId;
      const serviceName = quote.Service ? quote.Service.name : 'Personalizado';
      return [{
        text: `${userName} - ${serviceName}`,
        callback_data: `admin_quote:${quote.id}`
      }];
    });

    keyboard.push([
      { text: getText(language, 'back'), callback_data: 'menu:admin' }
    ]);

    await bot.sendMessage(chatId, getText(language, 'pending_quotes'), {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showPendingQuotes:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function showQuoteForAdmin(bot, query) {
  const chatId = query.message.chat.id;
  const quoteId = query.data.split(':')[1];

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const quote = await Cotization.findByPk(quoteId, {
      include: [
        { model: User },
        { model: Service }
      ]
    });

    if (!quote) {
      await bot.answerCallbackQuery(query.id, {
        text: 'Quote not found',
        show_alert: true
      });
      return;
    }

    await bot.answerCallbackQuery(query.id);

    const serviceName = quote.Service ? quote.Service.name : 'Servicio personalizado';
    const currentPrice = quote.price > 0 ? formatCurrency(quote.price) : 'No establecido';

    const quoteText =
      `📝 Cotización #${quote.id}\n\n` +
      `👤 Usuario: ${quote.User.chatId}\n` +
      `🗣️ Idioma: ${quote.User.language}\n` +
      `💇 Servicio: ${serviceName}\n` +
      `📋 Detalles: ${quote.details}\n` +
      `💰 Precio actual: ${currentPrice}\n` +
      `📅 Vence: ${formatDate(quote.expiryDate)}\n` +
      `📊 Estado: ${quote.status}`;

    const keyboard = [];

    if (quote.status === 'pending') {
      keyboard.push([
        { text: '💰 Establecer precio', callback_data: `set_price:${quote.id}` }
      ]);
    }

    keyboard.push([
      { text: '🔙 Volver', callback_data: 'admin:quotes' }
    ]);

    await bot.sendMessage(chatId, quoteText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showQuoteForAdmin:', error);
  }
}

async function handleSetPrice(bot, query) {
  const chatId = query.message.chat.id;
  const quoteId = query.data.split(':')[1];

  try {
    await bot.answerCallbackQuery(query.id);

    adminStates.set(chatId, { waitingFor: 'price', quoteId });

    await bot.sendMessage(chatId, 'Ingresa el precio para esta cotización (solo números):', {
      reply_markup: {
        force_reply: true
      }
    });

  } catch (error) {
    logger.error('Error in handleSetPrice:', error);
  }
}

async function handleAdminMessage(bot, msg) {
  const chatId = msg.chat.id;
  const state = adminStates.get(chatId);

  if (!state || !isAdmin(chatId)) {
    return false; // Not handling this message
  }

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });

    if (state.waitingFor === 'price') {
      const price = parseFloat(msg.text);

      if (isNaN(price) || price <= 0) {
        await bot.sendMessage(chatId, '❌ Precio inválido. Intenta de nuevo.');
        return true;
      }

      const quote = await Cotization.findByPk(state.quoteId, {
        include: [{ model: User }]
      });

      if (!quote) {
        await bot.sendMessage(chatId, '❌ Cotización no encontrada.');
        adminStates.delete(chatId);
        return true;
      }

      quote.price = price;
      await quote.save();

      adminStates.delete(chatId);

      await bot.sendMessage(chatId, `✅ Precio establecido: ${formatCurrency(price)}`);

      // Notify customer
      await bot.sendMessage(
        quote.User.chatId,
        getText(quote.User.language, 'quote_created', {
          details: quote.details,
          price: formatCurrency(price),
          expiryDate: formatDate(quote.expiryDate)
        }),
        {
          reply_markup: {
            inline_keyboard: [
              [
                { text: getText(quote.User.language, 'accept'), callback_data: `quote_action:${quote.id}:accept` },
                { text: getText(quote.User.language, 'reject'), callback_data: `quote_action:${quote.id}:reject` }
              ]
            ]
          }
        }
      );

      return true;
    }

  } catch (error) {
    logger.error('Error in handleAdminMessage:', error);
    adminStates.delete(chatId);
  }

  return false;
}

async function showPendingBookings(bot, chatId, language) {
  try {
    const bookings = await Booking.findAll({
      where: { status: 'pending' },
      include: [
        { model: User },
        { model: Cotization, include: [{ model: Service }] },
        { model: Service }
      ],
      order: [['date', 'ASC'], ['time', 'ASC']],
      limit: 10
    });

    if (bookings.length === 0) {
      await bot.sendMessage(chatId, 'No hay reservas pendientes.', {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(language, 'back'), callback_data: 'menu:admin' }]
          ]
        }
      });
      return;
    }

    const keyboard = bookings.map(booking => {
      const service = booking.Service || booking.Cotization?.Service;
      const serviceName = service ? service.name : 'Personalizado';
      return [{
        text: `${booking.User.chatId} - ${serviceName} - ${formatDate(booking.date)} ${booking.time}`,
        callback_data: `admin_booking:${booking.id}`
      }];
    });

    keyboard.push([
      { text: getText(language, 'back'), callback_data: 'menu:admin' }
    ]);

    await bot.sendMessage(chatId, getText(language, 'pending_bookings'), {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showPendingBookings:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function showBookingForAdmin(bot, query) {
  const chatId = query.message.chat.id;
  const bookingId = query.data.split(':')[1];

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: User },
        { model: Cotization, include: [{ model: Service }] },
        { model: Service }
      ]
    });

    if (!booking) {
      await bot.answerCallbackQuery(query.id, {
        text: 'Booking not found',
        show_alert: true
      });
      return;
    }

    await bot.answerCallbackQuery(query.id);

    const service = booking.Service || booking.Cotization?.Service;
    const serviceName = service ? service.name : 'Servicio personalizado';

    const bookingText =
      `📅 Reserva #${booking.id}\n\n` +
      `👤 Usuario: ${booking.User.chatId}\n` +
      `💇 Servicio: ${serviceName}\n` +
      `📆 Fecha: ${formatDate(booking.date)}\n` +
      `⏰ Hora: ${booking.time}\n` +
      `📊 Estado: ${booking.status}`;

    const keyboard = [];

    if (booking.status === 'pending') {
      keyboard.push([
        { text: '✅ Confirmar', callback_data: `booking_admin:${booking.id}:confirm` },
        { text: '❌ Cancelar', callback_data: `booking_admin:${booking.id}:cancel` }
      ]);
    }

    keyboard.push([
      { text: '🔙 Volver', callback_data: 'admin:bookings' }
    ]);

    await bot.sendMessage(chatId, bookingText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showBookingForAdmin:', error);
  }
}

async function handleBookingAdminAction(bot, query) {
  const chatId = query.message.chat.id;
  const [_, bookingId, action] = query.data.split(':');

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const booking = await Booking.findByPk(bookingId, {
      include: [{ model: User }]
    });

    if (!booking) {
      await bot.answerCallbackQuery(query.id, {
        text: 'Booking not found',
        show_alert: true
      });
      return;
    }

    if (action === 'confirm') {
      booking.status = 'confirmed';
      await booking.save();

      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, '✅ Reserva confirmada');

      // Notify customer
      await bot.sendMessage(
        booking.User.chatId,
        getText(booking.User.language, 'booking_confirmed')
      );

    } else if (action === 'cancel') {
      booking.status = 'cancelled';
      await booking.save();

      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, '❌ Reserva cancelada');

      // Notify customer
      await bot.sendMessage(
        booking.User.chatId,
        getText(booking.User.language, 'booking_cancelled')
      );
    }

  } catch (error) {
    logger.error('Error in handleBookingAdminAction:', error);
    await bot.answerCallbackQuery(query.id, {
      text: 'Error',
      show_alert: true
    });
  }
}

async function showServiceManagement(bot, chatId, language) {
  try {
    const services = await Service.findAll({
      order: [['category', 'ASC'], ['name', 'ASC']]
    });

    const keyboard = services.map(service => [{
      text: `${service.name} - ${formatCurrency(service.price)} ${service.isActive ? '✅' : '❌'}`,
      callback_data: `admin_service:${service.id}`
    }]);

    keyboard.push([
      { text: getText(language, 'back'), callback_data: 'menu:admin' }
    ]);

    await bot.sendMessage(chatId, getText(language, 'admin_services'), {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showServiceManagement:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function showStatistics(bot, chatId, language) {
  try {
    const totalUsers = await User.count();
    const totalQuotes = await Cotization.count();
    const pendingQuotes = await Cotization.count({ where: { status: 'pending' } });
    const acceptedQuotes = await Cotization.count({ where: { status: 'accepted' } });
    const totalBookings = await Booking.count();
    const pendingBookings = await Booking.count({ where: { status: 'pending' } });
    const confirmedBookings = await Booking.count({ where: { status: 'confirmed' } });

    const statsText =
      `📊 Estadísticas\n\n` +
      `👥 Usuarios totales: ${totalUsers}\n\n` +
      `💰 Cotizaciones:\n` +
      `  - Total: ${totalQuotes}\n` +
      `  - Pendientes: ${pendingQuotes}\n` +
      `  - Aceptadas: ${acceptedQuotes}\n\n` +
      `📅 Reservas:\n` +
      `  - Total: ${totalBookings}\n` +
      `  - Pendientes: ${pendingBookings}\n` +
      `  - Confirmadas: ${confirmedBookings}`;

    await bot.sendMessage(chatId, statsText, {
      reply_markup: {
        inline_keyboard: [
          [{ text: getText(language, 'back'), callback_data: 'menu:admin' }]
        ]
      }
    });

  } catch (error) {
    logger.error('Error in showStatistics:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

module.exports = {
  showAdminPanel,
  handleAdminAction,
  showPendingQuotes,
  showQuoteForAdmin,
  handleSetPrice,
  handleAdminMessage,
  showPendingBookings,
  showBookingForAdmin,
  handleBookingAdminAction,
  showServiceManagement,
  showStatistics,
};
