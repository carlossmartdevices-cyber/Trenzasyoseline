const { getText } = require('../locales');
const { Service } = require('../models');
const { formatCurrency } = require('../utils/helpers');
const logger = require('../utils/logger');

async function showServices(bot, chatId, language) {
  try {
    const services = await Service.findAll({
      where: { isActive: true },
      order: [['category', 'ASC'], ['price', 'ASC']]
    });

    if (services.length === 0) {
      await bot.sendMessage(chatId, getText(language, 'no_services'), {
        reply_markup: {
          inline_keyboard: [
            [{ text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }]
          ]
        }
      });
      return;
    }

    // Group services by category
    const servicesByCategory = {};
    services.forEach(service => {
      const category = service.category || 'general';
      if (!servicesByCategory[category]) {
        servicesByCategory[category] = [];
      }
      servicesByCategory[category].push(service);
    });

    // Create keyboard buttons
    const keyboard = [];
    Object.keys(servicesByCategory).forEach(category => {
      servicesByCategory[category].forEach(service => {
        keyboard.push([{
          text: `${service.name} - ${formatCurrency(service.price)}`,
          callback_data: `service:${service.id}`
        }]);
      });
    });

    keyboard.push([
      { text: getText(language, 'back_to_menu'), callback_data: 'back:menu' }
    ]);

    await bot.sendMessage(chatId, getText(language, 'services_title'), {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showServices:', error);
    await bot.sendMessage(chatId, getText(language, 'error_generic'));
  }
}

async function showServiceDetails(bot, query) {
  const chatId = query.message.chat.id;
  const serviceId = query.data.split(':')[1];

  try {
    const service = await Service.findByPk(serviceId);
    const { User } = require('../models');
    const user = await User.findOne({ where: { chatId: String(chatId) } });

    if (!service) {
      await bot.answerCallbackQuery(query.id, {
        text: getText(user.language, 'error_generic'),
        show_alert: true
      });
      return;
    }

    await bot.answerCallbackQuery(query.id);

    const detailsText = getText(user.language, 'service_details', {
      name: service.name,
      description: service.description,
      price: formatCurrency(service.price),
      duration: service.duration
    });

    const keyboard = [
      [{ text: getText(user.language, 'menu_quote'), callback_data: `quote_service:${service.id}` }],
      [{ text: getText(user.language, 'back'), callback_data: 'menu:services' }]
    ];

    await bot.sendMessage(chatId, detailsText, {
      reply_markup: {
        inline_keyboard: keyboard
      }
    });

  } catch (error) {
    logger.error('Error in showServiceDetails:', error);
  }
}

module.exports = {
  showServices,
  showServiceDetails,
};
