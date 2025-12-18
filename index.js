require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { sequelize } = require('./src/models');
const logger = require('./src/utils/logger');

// Import handlers
const startHandler = require('./src/handlers/start');
const menuHandler = require('./src/handlers/menu');
const servicesHandler = require('./src/handlers/services');
const quotesHandler = require('./src/handlers/quotes');
const bookingsHandler = require('./src/handlers/bookings');
const adminHandler = require('./src/handlers/admin');

// Validate environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
  logger.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

logger.info('Bot started successfully');

// Initialize database
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    // Sync database (create tables if they don\'t exist)
    await sequelize.sync({ alter: true });
    logger.info('Database synchronized');

  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

// Command handlers
bot.onText(/\/start/, (msg) => {
  startHandler.handleStart(bot, msg);
});

bot.onText(/\/menu/, async (msg) => {
  const { User } = require('./src/models');
  const user = await User.findOne({ where: { chatId: String(msg.chat.id) } });
  if (user) {
    menuHandler.showMainMenu(bot, msg.chat.id, user.language);
  } else {
    startHandler.handleStart(bot, msg);
  }
});

bot.onText(/\/help/, async (msg) => {
  const { User } = require('./src/models');
  const user = await User.findOne({ where: { chatId: String(msg.chat.id) } });
  if (user) {
    menuHandler.showHelp(bot, msg.chat.id, user.language);
  } else {
    startHandler.handleStart(bot, msg);
  }
});

bot.onText(/\/admin/, async (msg) => {
  const { User } = require('./src/models');
  const { isAdmin } = require('./src/utils/helpers');

  if (!isAdmin(msg.chat.id)) {
    return;
  }

  const user = await User.findOne({ where: { chatId: String(msg.chat.id) } });
  if (user) {
    adminHandler.showAdminPanel(bot, msg.chat.id, user.language);
  }
});

// Callback query handler
bot.on('callback_query', async (query) => {
  try {
    const data = query.data;

    // Language selection
    if (data.startsWith('lang:')) {
      await startHandler.handleLanguageSelection(bot, query);
    }
    // Gender selection
    else if (data.startsWith('gender:')) {
      await startHandler.handleGenderSelection(bot, query);
    }
    // Terms acceptance
    else if (data.startsWith('terms:')) {
      await startHandler.handleTermsAcceptance(bot, query);
    }
    // Menu navigation
    else if (data.startsWith('menu:')) {
      await menuHandler.handleMenuSelection(bot, query);
    }
    // Back navigation
    else if (data.startsWith('back:')) {
      await menuHandler.handleBack(bot, query);
    }
    // Service details
    else if (data.startsWith('service:')) {
      await servicesHandler.showServiceDetails(bot, query);
    }
    // Quote service
    else if (data.startsWith('quote_service:')) {
      const serviceId = data.split(':')[1];
      const { User } = require('./src/models');
      const user = await User.findOne({ where: { chatId: String(query.message.chat.id) } });
      await bot.answerCallbackQuery(query.id);
      await quotesHandler.requestQuote(bot, query.message.chat.id, user.language, serviceId);
    }
    // Quote details
    else if (data.startsWith('quote:') && !data.startsWith('quote_action:')) {
      await quotesHandler.showQuoteDetails(bot, query);
    }
    // Quote action
    else if (data.startsWith('quote_action:')) {
      await quotesHandler.handleQuoteAction(bot, query);
    }
    // Book quote
    else if (data.startsWith('book_quote:')) {
      const quoteId = data.split(':')[1];
      await bookingsHandler.startBooking(bot, query, quoteId);
    }
    // Calendar navigation
    else if (data.startsWith('cal:')) {
      await bookingsHandler.handleCalendarNavigation(bot, query);
    }
    // Date selection
    else if (data.startsWith('date:')) {
      await bookingsHandler.handleDateSelection(bot, query);
    }
    // Time selection
    else if (data.startsWith('time:')) {
      await bookingsHandler.handleTimeSelection(bot, query);
    }
    // Booking details
    else if (data.startsWith('booking:') && !data.startsWith('booking_action:') && !data.startsWith('booking_admin:')) {
      await bookingsHandler.showBookingDetails(bot, query);
    }
    // Booking action
    else if (data.startsWith('booking_action:')) {
      await bookingsHandler.handleBookingAction(bot, query);
    }
    // Admin panel
    else if (data.startsWith('admin:')) {
      await adminHandler.handleAdminAction(bot, query);
    }
    // Admin quote
    else if (data.startsWith('admin_quote:')) {
      await adminHandler.showQuoteForAdmin(bot, query);
    }
    // Set price
    else if (data.startsWith('set_price:')) {
      await adminHandler.handleSetPrice(bot, query);
    }
    // Admin booking
    else if (data.startsWith('admin_booking:')) {
      await adminHandler.showBookingForAdmin(bot, query);
    }
    // Admin booking action
    else if (data.startsWith('booking_admin:')) {
      await adminHandler.handleBookingAdminAction(bot, query);
    }
    // Ignore
    else if (data === 'ignore') {
      await bot.answerCallbackQuery(query.id);
    }
    // Unknown callback
    else {
      logger.warn(`Unknown callback query: ${data}`);
      await bot.answerCallbackQuery(query.id);
    }

  } catch (error) {
    logger.error('Error handling callback query:', error);
    await bot.answerCallbackQuery(query.id, {
      text: 'An error occurred. Please try again.',
      show_alert: true
    });
  }
});

// Message handler for text inputs
bot.on('message', async (msg) => {
  try {
    // Skip if message is a command
    if (msg.text && msg.text.startsWith('/')) {
      return;
    }

    const chatId = msg.chat.id;

    // Check if admin is in a state waiting for input
    const adminHandled = await adminHandler.handleAdminMessage(bot, msg);
    if (adminHandled) {
      return;
    }

    // Check if user is in quote request flow
    const quoteState = quotesHandler.getUserState(chatId);
    if (quoteState && quoteState.waitingFor === 'quote_details') {
      await quotesHandler.handleQuoteDetails(bot, msg);
      return;
    }

  } catch (error) {
    logger.error('Error handling message:', error);
  }
});

// Error handlers
bot.on('polling_error', (error) => {
  logger.error('Polling error:', error);
});

bot.on('error', (error) => {
  logger.error('Bot error:', error);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Bot shutting down...');
  await bot.stopPolling();
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Bot shutting down...');
  await bot.stopPolling();
  await sequelize.close();
  process.exit(0);
});

// Initialize and start
initializeDatabase().then(() => {
  logger.info('Bot is ready and listening for messages');
  console.log('🤖 Trenzas y Oseline Bot is running...');
  console.log('📱 Press Ctrl+C to stop');
});
