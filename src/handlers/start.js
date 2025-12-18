const { getText } = require('../locales');
const { User } = require('../models');
const logger = require('../utils/logger');

async function handleStart(bot, msg) {
  const chatId = msg.chat.id;

  try {
    // Check if user exists
    let user = await User.findOne({ where: { chatId: String(chatId) } });

    if (user && user.acceptedTerms) {
      // User already registered, show main menu
      const text = getText(user.language, 'registration_complete');
      await bot.sendMessage(chatId, text);
      require('./menu').showMainMenu(bot, chatId, user.language);
      return;
    }

    // New user - start registration
    await bot.sendMessage(chatId, getText('es', 'welcome'), {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🇪🇸 Español', callback_data: 'lang:es' },
            { text: '🇬🇧 English', callback_data: 'lang:en' }
          ]
        ]
      }
    });

  } catch (error) {
    logger.error('Error in handleStart:', error);
    await bot.sendMessage(chatId, getText('es', 'error_generic'));
  }
}

async function handleLanguageSelection(bot, query) {
  const chatId = query.message.chat.id;
  const lang = query.data.split(':')[1];

  try {
    // Create or update user
    let user = await User.findOne({ where: { chatId: String(chatId) } });

    if (!user) {
      user = await User.create({
        chatId: String(chatId),
        language: lang === 'en' ? 'English' : 'Español',
        acceptedTerms: false,
      });
    } else {
      user.language = lang === 'en' ? 'English' : 'Español';
      await user.save();
    }

    // Show gender selection
    await bot.editMessageText(getText(user.language, 'language_selected'), {
      chat_id: chatId,
      message_id: query.message.message_id,
    });

    setTimeout(async () => {
      await bot.sendMessage(chatId, getText(user.language, 'select_gender'), {
        reply_markup: {
          inline_keyboard: [
            [
              { text: getText(user.language, 'female'), callback_data: 'gender:female' },
              { text: getText(user.language, 'male'), callback_data: 'gender:male' }
            ],
            [
              { text: getText(user.language, 'other'), callback_data: 'gender:other' }
            ]
          ]
        }
      });
    }, 500);

  } catch (error) {
    logger.error('Error in handleLanguageSelection:', error);
    await bot.sendMessage(chatId, getText('es', 'error_generic'));
  }
}

async function handleGenderSelection(bot, query) {
  const chatId = query.message.chat.id;
  const gender = query.data.split(':')[1];

  try {
    let user = await User.findOne({ where: { chatId: String(chatId) } });

    if (!user) {
      await bot.sendMessage(chatId, getText('es', 'error_not_registered'));
      return;
    }

    user.gender = gender.charAt(0).toUpperCase() + gender.slice(1);
    await user.save();

    await bot.editMessageText(
      getText(user.language, 'gender_selected', { gender: getText(user.language, gender) }),
      {
        chat_id: chatId,
        message_id: query.message.message_id,
      }
    );

    // Show terms and conditions
    setTimeout(async () => {
      await bot.sendMessage(chatId, getText(user.language, 'terms_and_conditions'), {
        reply_markup: {
          inline_keyboard: [
            [
              { text: getText(user.language, 'yes'), callback_data: 'terms:accept' },
              { text: getText(user.language, 'no'), callback_data: 'terms:reject' }
            ]
          ]
        }
      });
    }, 500);

  } catch (error) {
    logger.error('Error in handleGenderSelection:', error);
    await bot.sendMessage(chatId, getText('es', 'error_generic'));
  }
}

async function handleTermsAcceptance(bot, query) {
  const chatId = query.message.chat.id;
  const action = query.data.split(':')[1];

  try {
    let user = await User.findOne({ where: { chatId: String(chatId) } });

    if (!user) {
      await bot.sendMessage(chatId, getText('es', 'error_not_registered'));
      return;
    }

    if (action === 'accept') {
      user.acceptedTerms = true;
      await user.save();

      await bot.editMessageText(getText(user.language, 'terms_accepted'), {
        chat_id: chatId,
        message_id: query.message.message_id,
      });

      setTimeout(async () => {
        await bot.sendMessage(chatId, getText(user.language, 'registration_complete'));
        require('./menu').showMainMenu(bot, chatId, user.language);
      }, 500);
    } else {
      await bot.editMessageText(
        'Registration cancelled. Use /start to begin again.',
        {
          chat_id: chatId,
          message_id: query.message.message_id,
        }
      );
    }

  } catch (error) {
    logger.error('Error in handleTermsAcceptance:', error);
    await bot.sendMessage(chatId, getText('es', 'error_generic'));
  }
}

module.exports = {
  handleStart,
  handleLanguageSelection,
  handleGenderSelection,
  handleTermsAcceptance,
};
