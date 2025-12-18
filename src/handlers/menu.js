const { getText } = require('../locales');
const { User } = require('../models');
const { isAdmin } = require('../utils/helpers');
const logger = require('../utils/logger');

async function showMainMenu(bot, chatId, language) {
  try {
    const keyboard = [
      [
        { text: getText(language, 'menu_services'), callback_data: 'menu:services' },
        { text: getText(language, 'menu_quote'), callback_data: 'menu:quote' }
      ],
      [
        { text: getText(language, 'menu_bookings'), callback_data: 'menu:bookings' },
        { text: getText(language, 'menu_help'), callback_data: 'menu:help' }
      ],
      [
        { text: getText(language, 'menu_settings'), callback_data: 'menu:settings' }
      ]
    ];

    // Add admin panel button if user is admin
    if (isAdmin(chatId)) {
      keyboard.push([
        { text: getText(language, 'menu_admin'), callback_data: 'menu:admin' }
      ]);
    }

    await bot.sendMessage(chatId, getText(language, 'main_menu'), {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });
  } catch (error) {
    logger.error('Error in showMainMenu:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function handleMenuSelection(bot, query) {
  const chatId = query.message.chat.id;
  const action = query.data.split(':')[1];

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });

    if (!user || !user.acceptedTerms) {
      await bot.answerCallbackQuery(query.id, {
        text: getText('es', 'error_not_registered'),
        show_alert: true
      });
      return;
    }

    await bot.answerCallbackQuery(query.id);

    switch (action) {
      case 'services':
        await require('./services').showServices(bot, chatId, user.language);
        break;

      case 'quote':
        await require('./quotes').requestQuote(bot, chatId, user.language);
        break;

      case 'bookings':
        await require('./bookings').showMyBookings(bot, chatId, user.language);
        break;

      case 'help':
        await showHelp(bot, chatId, user.language);
        break;

      case 'settings':
        await showSettings(bot, chatId, user.language);
        break;

      case 'admin':
        if (isAdmin(chatId)) {
          await require('./admin').showAdminPanel(bot, chatId, user.language);
        } else {
          await bot.sendMessage(chatId, getText(user.language, 'error_admin_only'));
        }
        break;

      default:
        await showMainMenu(bot, chatId, user.language);
    }

  } catch (error) {
    logger.error('Error in handleMenuSelection:', error);
    const user = await User.findOne({ where: { chatId: String(chatId) } });
    await bot.sendMessage(chatId, getText(user?.language || 'es', 'error_generic'));
  }
}

async function showHelp(bot, chatId, language) {
  const helpText = getText(language, 'help_message', {
    phone: process.env.BUSINESS_PHONE || 'N/A',
    address: process.env.BUSINESS_ADDRESS || 'N/A',
    hours: process.env.BUSINESS_HOURS || 'N/A'
  });

  await bot.sendMessage(chatId, helpText, {
    reply_markup: {
      inline_keyboard: [
        [{ text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }]
      ]
    }
  });
}

async function showSettings(bot, chatId, language) {
  await bot.sendMessage(chatId, getText(language, 'settings_menu'), {
    reply_markup: {
      inline_keyboard: [
        [{ text: getText(language, 'change_language'), callback_data: 'settings:language' }],
        [{ text: getText(language, 'change_gender'), callback_data: 'settings:gender' }],
        [{ text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }]
      ]
    }
  });
}

async function handleBack(bot, query) {
  const chatId = query.message.chat.id;
  const destination = query.data.split(':')[1];

  try {
    const user = await User.findOne({ where: { chatId: String(chatId) } });

    await bot.answerCallbackQuery(query.id);

    if (destination === 'menu') {
      await showMainMenu(bot, chatId, user.language);
    }
  } catch (error) {
    logger.error('Error in handleBack:', error);
  }
}

module.exports = {
  showMainMenu,
  handleMenuSelection,
  showHelp,
  showSettings,
  handleBack,
};
