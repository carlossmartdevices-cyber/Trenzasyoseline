const { getText } = require('../locales');
const { User, Cotization, Service } = require('../models');
const { formatCurrency, formatDate, getDateFromNow } = require('../utils/helpers');
const logger = require('../utils/logger');

// Store user states for quote requests
const userStates = new Map();

async function requestQuote(bot, chatId, language, serviceId = null) {
  try {
    userStates.set(chatId, { waitingFor: 'quote_details', serviceId });

    await bot.sendMessage(chatId, getText(language, 'quote_request'), {
      reply_markup: {
        force_reply: true
      }
    });

  } catch (error) {
    logger.error('Error in requestQuote:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function handleQuoteDetails(bot, msg) {
  const chatId = msg.chat.id;
  const details = msg.text;

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });

    if (!user) {
      await bot.sendMessage(chatId, getText('es', 'error_not_registered'));
      return;
    }

    const state = userStates.get(chatId);

    // Create a quote request (pending admin response)
    await Cotization.create({
      userId: user.id,
      serviceId: state?.serviceId || null,
      details: details,
      price: 0, // Admin will set the price
      expiryDate: getDateFromNow(parseInt(process.env.QUOTE_EXPIRY_DAYS || 7)),
      status: 'pending'
    });

    userStates.delete(chatId);

    await bot.sendMessage(chatId, getText(user.language, 'quote_received'), {
      reply_markup: {
        inline_keyboard: [
          [{ text: getText(user.language, 'back_to_menu'), callback_data: 'back:menu' }]
        ]
      }
    });

    // Notify admins
    await notifyAdminsNewQuote(bot, user, details);

  } catch (error) {
    logger.error('Error in handleQuoteDetails:', error);
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    await bot.sendMessage(chatId, getText(user?.language || 'es', 'error_generic'));
  }
}

async function showMyQuotes(bot, chatId, language) {
  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });

    const quotes = await Cotization.findAll({
      where: { userId: user.id },
      include: [{ model: Service }],
      order: [['createdAt', 'DESC']]
    });

    if (quotes.length === 0) {
      await bot.sendMessage(chatId, getText(language, 'no_quotes'), {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }]
          ]
        }
      });
      return;
    }

    const keyboard = quotes.map(quote => {
      const serviceName = quote.Service ? quote.Service.name : 'Servicio personalizado';
      const price = quote.price > 0 ? formatCurrency(quote.price) : 'Pendiente';
      return [{
        text: `${serviceName} - ${price} (${getText(language, `status_${quote.status}`)})`,
        callback_data: `quote:${quote.id}`
      }];
    });

    keyboard.push([
      { text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }
    ]);

    await bot.sendMessage(chatId, getText(language, 'my_quotes'), {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showMyQuotes:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function showQuoteDetails(bot, query) {
  const chatId = query.message.chat.id;
  const quoteId = query.data.split(':')[1];

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const quote = await Cotization.findByPk(quoteId, {
      include: [{ model: Service }]
    });

    if (!quote || quote.userId !== user.id) {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_generic'),
        show_alert: true
      });
      return;
    }

    await bot.answerCallbackQuery(query.id);

    const serviceName = quote.Service ? quote.Service.name : 'Servicio personalizado';
    const quoteText = getText(user.language, 'quote_created', {
      details: `${serviceName}\n${quote.details}`,
      price: formatCurrency(quote.price),
      expiryDate: formatDate(quote.expiryDate)
    });

    const statusText = `\n\n${getText(user.language, 'quote_status', {
      status: getText(user.language, `status_${quote.status}`)
    })}`;

    const keyboard = [];

    if (quote.status === 'pending' && quote.price > 0) {
      keyboard.push([
        { text: getText(user.language, 'accept'), callback_data: `quote_action:${quote.id}:accept` },
        { text: getText(user.language, 'reject'), callback_data: `quote_action:${quote.id}:reject` }
      ]);
    } else if (quote.status === 'accepted') {
      keyboard.push([
        { text: getText(user.language, 'menu_bookings'), callback_data: `book_quote:${quote.id}` }
      ]);
    }

    keyboard.push([
      { text: getText(user.language, 'back'), callback_data: 'menu:bookings' }
    ]);

    await bot.sendMessage(chatId, quoteText + statusText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showQuoteDetails:', error);
  }
}

async function handleQuoteAction(bot, query) {
  const chatId = query.message.chat.id;
  const [_, quoteId, action] = query.data.split(':');

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    const quote = await Cotization.findByPk(quoteId);

    if (!quote || quote.userId !== user.id) {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_generic'),
        show_alert: true
      });
      return;
    }

    if (action === 'accept') {
      quote.status = 'accepted';
      await quote.save();

      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, getText(user.language, 'quote_accepted'), {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(user.language, 'menu_bookings'), callback_data: `book_quote:${quote.id}` }],
            [{ text: getText(user.language, 'back_to_menu'), callback_data: 'back:menu' }]
          ]
        }
      });

    } else if (action === 'reject') {
      quote.status = 'rejected';
      await quote.save();

      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, getText(user.language, 'quote_rejected'), {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(user.language, 'back_to_menu'), callback_data: 'back:menu' }]
          ]
        }
      });
    }

  } catch (error) {
    logger.error('Error in handleQuoteAction:', error);
    await bot.answerCallbackQuery(query.id, {
      text: getText(user.language, 'error_generic'),
      show_alert: true
    });
  }
}

async function notifyAdminsNewQuote(bot, user, details) {
  const { isAdmin } = require('../utils/helpers');
  const adminIds = (process.env.ADMIN_CHAT_IDS || '').split(',').map(id => id.trim());

  for (const adminId of adminIds) {
    try {
      await bot.sendMessage(adminId,
        `🔔 Nueva solicitud de cotización\n\n` +
        `Usuario: ${user.chatId}\n` +
        `Idioma: ${user.language}\n` +
        `Detalles: ${details}\n\n` +
        `Usa el panel de admin para responder.`
      );
    } catch (error) {
      logger.error(`Error notifying admin ${adminId}:`, error);
    }
  }
}

function getUserState(chatId) {
  return userStates.get(chatId);
}

function clearUserState(chatId) {
  userStates.delete(chatId);
}

module.exports = {
  requestQuote,
  handleQuoteDetails,
  showMyQuotes,
  showQuoteDetails,
  handleQuoteAction,
  getUserState,
  clearUserState,
};
