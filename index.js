require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { sequelize, User, Cotization, Booking, Admin } = require('./src/models');

// Initialize bot
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

// User session storage
const userSessions = new Map();

// Language translations
const translations = {
  es: {
    welcome: '¡Bienvenid@ a Trenzas y Oseline! 💁‍♀️\n\nSomos especialistas en trenzas africanas.\n\nPor favor, selecciona tu género para continuar:',
    selectGender: 'Selecciona tu género:',
    female: '👩 Femenino',
    male: '👨 Masculino',
    other: '🧑 Otro',
    terms: 'Por favor, acepta nuestros términos y condiciones para continuar:\n\n📋 Al usar este servicio aceptas:\n- Políticas de cancelación\n- Términos de pago\n- Cuidado posterior al servicio',
    acceptTerms: '✅ Acepto los términos',
    mainMenu: '🏠 Menú Principal\n\n¿Qué te gustaría hacer hoy?',
    requestQuote: '💰 Solicitar Cotización',
    viewQuotes: '📋 Ver mis Cotizaciones',
    makeBooking: '📅 Agendar Cita',
    viewBookings: '📆 Ver mis Citas',
    catalog: '📸 Ver Catálogo',
    help: '❓ Ayuda',
    cancel: '❌ Cancelar',
    back: '⬅️ Volver',
    describeService: 'Por favor, describe el servicio que deseas:\n\nPuedes incluir:\n- Tipo de trenzas\n- Longitud deseada\n- Color o estilo especial\n- Cualquier detalle adicional',
    quoteRequested: '✅ ¡Cotización solicitada!\n\nTu solicitud ha sido enviada. Un administrador te responderá pronto con el precio y detalles.',
    noQuotes: 'No tienes cotizaciones disponibles todavía.',
    quoteStatus: {
      pending: '⏳ Pendiente',
      accepted: '✅ Aceptada',
      rejected: '❌ Rechazada',
      expired: '⏰ Expirada'
    },
    bookingStatus: {
      pending: '⏳ Pendiente',
      confirmed: '✅ Confirmada',
      cancelled: '❌ Cancelada',
      completed: '✔️ Completada'
    },
    selectQuote: 'Selecciona una cotización para agendar:',
    noAcceptedQuotes: 'No tienes cotizaciones aceptadas disponibles para agendar.',
    selectDate: 'Por favor, envía la fecha deseada en formato DD/MM/YYYY\n\nEjemplo: 25/12/2024',
    selectTime: 'Por favor, envía la hora deseada en formato HH:MM\n\nEjemplo: 14:30',
    bookingCreated: '✅ ¡Cita agendada!\n\nTu cita ha sido registrada. Recibirás una confirmación pronto.',
    noBookings: 'No tienes citas agendadas.',
    catalog_text: '📸 Catálogo de Servicios\n\nNuestros servicios incluyen:\n\n1️⃣ Box Braids - Desde $120.000\n2️⃣ Trenzas Africanas - Desde $150.000\n3️⃣ Cornrows - Desde $80.000\n4️⃣ Senegalese Twists - Desde $180.000\n5️⃣ Knotless Braids - Desde $200.000\n\n💡 Los precios varían según longitud y complejidad.',
    help_text: '❓ Ayuda\n\n🔹 Solicitar Cotización: Describe el servicio que necesitas\n🔹 Ver Cotizaciones: Revisa tus cotizaciones pendientes y aceptadas\n🔹 Agendar Cita: Agenda una cita para un servicio cotizado\n🔹 Ver Citas: Revisa tus citas agendadas\n🔹 Catálogo: Explora nuestros servicios y precios\n\n📞 Contacto: @OselineAdmin',
    adminPanel: '👑 Panel de Administrador',
    pendingQuotes: '📋 Cotizaciones Pendientes',
    pendingBookings: '📅 Citas Pendientes',
    setPaymentLink: '💳 Configurar Link de Pago',
    noPendingQuotes: 'No hay cotizaciones pendientes.',
    noPendingBookings: 'No hay citas pendientes.',
    setPrice: 'Establece el precio (solo números):',
    quoteApproved: '✅ Cotización aprobada y enviada al usuario.',
    quoteRejected: '❌ Cotización rechazada.',
    bookingConfirmed: '✅ Cita confirmada y notificación enviada al usuario.',
    bookingCancelled: '❌ Cita cancelada.',
    invalidFormat: '❌ Formato inválido. Por favor intenta de nuevo.',
    operationCancelled: '❌ Operación cancelada.'
  },
  en: {
    welcome: 'Welcome to Trenzas y Oseline! 💁‍♀️\n\nWe specialize in African braids.\n\nPlease select your gender to continue:',
    selectGender: 'Select your gender:',
    female: '👩 Female',
    male: '👨 Male',
    other: '🧑 Other',
    terms: 'Please accept our terms and conditions to continue:\n\n📋 By using this service you accept:\n- Cancellation policies\n- Payment terms\n- Post-service care',
    acceptTerms: '✅ I Accept',
    mainMenu: '🏠 Main Menu\n\nWhat would you like to do today?',
    requestQuote: '💰 Request Quote',
    viewQuotes: '📋 View my Quotes',
    makeBooking: '📅 Schedule Appointment',
    viewBookings: '📆 View my Appointments',
    catalog: '📸 View Catalog',
    help: '❓ Help',
    cancel: '❌ Cancel',
    back: '⬅️ Back',
    describeService: 'Please describe the service you want:\n\nYou can include:\n- Type of braids\n- Desired length\n- Color or special style\n- Any additional details',
    quoteRequested: '✅ Quote requested!\n\nYour request has been sent. An admin will respond soon with pricing and details.',
    noQuotes: 'You don\'t have any quotes yet.',
    quoteStatus: {
      pending: '⏳ Pending',
      accepted: '✅ Accepted',
      rejected: '❌ Rejected',
      expired: '⏰ Expired'
    },
    bookingStatus: {
      pending: '⏳ Pending',
      confirmed: '✅ Confirmed',
      cancelled: '❌ Cancelled',
      completed: '✔️ Completed'
    },
    selectQuote: 'Select a quote to schedule:',
    noAcceptedQuotes: 'You don\'t have any accepted quotes available to schedule.',
    selectDate: 'Please send the desired date in DD/MM/YYYY format\n\nExample: 25/12/2024',
    selectTime: 'Please send the desired time in HH:MM format\n\nExample: 14:30',
    bookingCreated: '✅ Appointment scheduled!\n\nYour appointment has been registered. You\'ll receive confirmation soon.',
    noBookings: 'You don\'t have any scheduled appointments.',
    catalog_text: '📸 Service Catalog\n\nOur services include:\n\n1️⃣ Box Braids - From $120.000\n2️⃣ African Braids - From $150.000\n3️⃣ Cornrows - From $80.000\n4️⃣ Senegalese Twists - From $180.000\n5️⃣ Knotless Braids - From $200.000\n\n💡 Prices vary by length and complexity.',
    help_text: '❓ Help\n\n🔹 Request Quote: Describe the service you need\n🔹 View Quotes: Check your pending and accepted quotes\n🔹 Schedule Appointment: Book an appointment for a quoted service\n🔹 View Appointments: Check your scheduled appointments\n🔹 Catalog: Explore our services and prices\n\n📞 Contact: @OselineAdmin',
    adminPanel: '👑 Admin Panel',
    pendingQuotes: '📋 Pending Quotes',
    pendingBookings: '📅 Pending Appointments',
    setPaymentLink: '💳 Set Payment Link',
    noPendingQuotes: 'No pending quotes.',
    noPendingBookings: 'No pending appointments.',
    setPrice: 'Set the price (numbers only):',
    quoteApproved: '✅ Quote approved and sent to user.',
    quoteRejected: '❌ Quote rejected.',
    bookingConfirmed: '✅ Appointment confirmed and notification sent to user.',
    bookingCancelled: '❌ Appointment cancelled.',
    invalidFormat: '❌ Invalid format. Please try again.',
    operationCancelled: '❌ Operation cancelled.'
  }
};

// Helper function to get translation
function t(lang, key) {
  const language = lang === 'English' ? 'en' : 'es';
  const keys = key.split('.');
  let value = translations[language];
  for (const k of keys) {
    value = value[k];
  }
  return value || key;
}

// Helper function to get or create user
async function getOrCreateUser(chatId) {
  const [user] = await User.findOrCreate({
    where: { chatId: chatId.toString() },
    defaults: { chatId: chatId.toString(), language: 'Español' }
  });
  return user;
}

// Helper function to check if user is admin
async function isAdmin(userId) {
  const admin = await Admin.findOne({ where: { userId } });
  return !!admin;
}

// Command: /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await getOrCreateUser(chatId);

    if (!user.acceptedTerms) {
      // Show language selection
      const keyboard = {
        inline_keyboard: [
          [{ text: 'Español 🇪🇸', callback_data: 'lang_es' }],
          [{ text: 'English 🇬🇧', callback_data: 'lang_en' }]
        ]
      };

      bot.sendMessage(chatId, 'Select your language / Selecciona tu idioma:', {
        reply_markup: keyboard
      });
    } else {
      showMainMenu(chatId, user);
    }
  } catch (error) {
    console.error('Error in /start:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again.');
  }
});

// Command: /admin
bot.onText(/\/admin/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const user = await getOrCreateUser(chatId);
    const adminUser = await isAdmin(user.id);

    if (!adminUser) {
      bot.sendMessage(chatId, '❌ No tienes permisos de administrador.');
      return;
    }

    showAdminPanel(chatId, user);
  } catch (error) {
    console.error('Error in /admin:', error);
    bot.sendMessage(chatId, 'An error occurred.');
  }
});

// Show main menu
async function showMainMenu(chatId, user) {
  const keyboard = {
    inline_keyboard: [
      [{ text: t(user.language, 'requestQuote'), callback_data: 'request_quote' }],
      [{ text: t(user.language, 'viewQuotes'), callback_data: 'view_quotes' }],
      [{ text: t(user.language, 'makeBooking'), callback_data: 'make_booking' }],
      [{ text: t(user.language, 'viewBookings'), callback_data: 'view_bookings' }],
      [{ text: t(user.language, 'catalog'), callback_data: 'catalog' }],
      [{ text: t(user.language, 'help'), callback_data: 'help' }]
    ]
  };

  const adminUser = await isAdmin(user.id);
  if (adminUser) {
    keyboard.inline_keyboard.push([{ text: t(user.language, 'adminPanel'), callback_data: 'admin_panel' }]);
  }

  bot.sendMessage(chatId, t(user.language, 'mainMenu'), {
    reply_markup: keyboard
  });
}

// Show admin panel
async function showAdminPanel(chatId, user) {
  const keyboard = {
    inline_keyboard: [
      [{ text: t(user.language, 'pendingQuotes'), callback_data: 'admin_pending_quotes' }],
      [{ text: t(user.language, 'pendingBookings'), callback_data: 'admin_pending_bookings' }],
      [{ text: t(user.language, 'setPaymentLink'), callback_data: 'admin_set_payment' }],
      [{ text: t(user.language, 'back'), callback_data: 'main_menu' }]
    ]
  };

  bot.sendMessage(chatId, t(user.language, 'adminPanel'), {
    reply_markup: keyboard
  });
}

// Handle callback queries
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const data = query.data;
  const messageId = query.message.message_id;

  try {
    const user = await getOrCreateUser(chatId);

    // Language selection
    if (data.startsWith('lang_')) {
      const lang = data === 'lang_es' ? 'Español' : 'English';
      await user.update({ language: lang });

      // Show gender selection
      const keyboard = {
        inline_keyboard: [
          [{ text: t(lang, 'female'), callback_data: 'gender_female' }],
          [{ text: t(lang, 'male'), callback_data: 'gender_male' }],
          [{ text: t(lang, 'other'), callback_data: 'gender_other' }]
        ]
      };

      bot.editMessageText(t(lang, 'welcome'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard
      });
    }

    // Gender selection
    else if (data.startsWith('gender_')) {
      const gender = data.split('_')[1];
      const genderText = gender === 'female' ? 'Femenino' : gender === 'male' ? 'Masculino' : 'Otro';
      await user.update({ gender: genderText });

      // Show terms
      const keyboard = {
        inline_keyboard: [
          [{ text: t(user.language, 'acceptTerms'), callback_data: 'accept_terms' }]
        ]
      };

      bot.editMessageText(t(user.language, 'terms'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard
      });
    }

    // Accept terms
    else if (data === 'accept_terms') {
      await user.update({ acceptedTerms: true });
      bot.deleteMessage(chatId, messageId);
      showMainMenu(chatId, user);
    }

    // Main menu
    else if (data === 'main_menu') {
      bot.deleteMessage(chatId, messageId);
      showMainMenu(chatId, user);
    }

    // Request quote
    else if (data === 'request_quote') {
      userSessions.set(chatId, { action: 'request_quote' });
      bot.editMessageText(t(user.language, 'describeService'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'cancel'), callback_data: 'main_menu' }]]
        }
      });
    }

    // View quotes
    else if (data === 'view_quotes') {
      const quotes = await Cotization.findAll({ where: { userId: user.id } });

      if (quotes.length === 0) {
        bot.answerCallbackQuery(query.id, { text: t(user.language, 'noQuotes'), show_alert: true });
        return;
      }

      let message = '📋 Tus Cotizaciones:\n\n';
      quotes.forEach((quote, index) => {
        const status = t(user.language, `quoteStatus.${quote.status}`);
        message += `${index + 1}. ${quote.details}\n`;
        message += `   💰 Precio: $${parseFloat(quote.price).toLocaleString()}\n`;
        message += `   Estado: ${status}\n`;
        message += `   📅 Expira: ${new Date(quote.expiryDate).toLocaleDateString()}\n\n`;
      });

      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'back'), callback_data: 'main_menu' }]]
        }
      });
    }

    // Make booking
    else if (data === 'make_booking') {
      const quotes = await Cotization.findAll({
        where: { userId: user.id, status: 'accepted' }
      });

      if (quotes.length === 0) {
        bot.answerCallbackQuery(query.id, { text: t(user.language, 'noAcceptedQuotes'), show_alert: true });
        return;
      }

      const keyboard = {
        inline_keyboard: quotes.map(quote => [
          { text: `${quote.details} - $${parseFloat(quote.price).toLocaleString()}`, callback_data: `book_${quote.id}` }
        ])
      };
      keyboard.inline_keyboard.push([{ text: t(user.language, 'cancel'), callback_data: 'main_menu' }]);

      bot.editMessageText(t(user.language, 'selectQuote'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard
      });
    }

    // Select quote for booking
    else if (data.startsWith('book_')) {
      const quoteId = parseInt(data.split('_')[1]);
      userSessions.set(chatId, { action: 'booking_date', quoteId });

      bot.editMessageText(t(user.language, 'selectDate'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'cancel'), callback_data: 'main_menu' }]]
        }
      });
    }

    // View bookings
    else if (data === 'view_bookings') {
      const bookings = await Booking.findAll({
        where: { userId: user.id },
        include: [{ model: Cotization }]
      });

      if (bookings.length === 0) {
        bot.answerCallbackQuery(query.id, { text: t(user.language, 'noBookings'), show_alert: true });
        return;
      }

      let message = '📆 Tus Citas:\n\n';
      bookings.forEach((booking, index) => {
        const status = t(user.language, `bookingStatus.${booking.status}`);
        message += `${index + 1}. ${booking.Cotization.details}\n`;
        message += `   📅 Fecha: ${new Date(booking.date).toLocaleDateString()}\n`;
        message += `   ⏰ Hora: ${booking.time}\n`;
        message += `   Estado: ${status}\n\n`;
      });

      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'back'), callback_data: 'main_menu' }]]
        }
      });
    }

    // Catalog
    else if (data === 'catalog') {
      bot.editMessageText(t(user.language, 'catalog_text'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'back'), callback_data: 'main_menu' }]]
        }
      });
    }

    // Help
    else if (data === 'help') {
      bot.editMessageText(t(user.language, 'help_text'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'back'), callback_data: 'main_menu' }]]
        }
      });
    }

    // Admin panel
    else if (data === 'admin_panel') {
      const adminUser = await isAdmin(user.id);
      if (!adminUser) {
        bot.answerCallbackQuery(query.id, { text: '❌ No autorizado', show_alert: true });
        return;
      }
      bot.deleteMessage(chatId, messageId);
      showAdminPanel(chatId, user);
    }

    // Admin: pending quotes
    else if (data === 'admin_pending_quotes') {
      const quotes = await Cotization.findAll({
        where: { status: 'pending' },
        include: [{ model: User }]
      });

      if (quotes.length === 0) {
        bot.answerCallbackQuery(query.id, { text: t(user.language, 'noPendingQuotes'), show_alert: true });
        return;
      }

      const keyboard = {
        inline_keyboard: quotes.map(quote => [
          { text: `${quote.User.chatId}: ${quote.details}`, callback_data: `admin_quote_${quote.id}` }
        ])
      };
      keyboard.inline_keyboard.push([{ text: t(user.language, 'back'), callback_data: 'admin_panel' }]);

      bot.editMessageText('📋 Cotizaciones Pendientes:', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard
      });
    }

    // Admin: view quote details
    else if (data.startsWith('admin_quote_')) {
      const quoteId = parseInt(data.split('_')[2]);
      const quote = await Cotization.findByPk(quoteId, { include: [{ model: User }] });

      const message = `📋 Cotización #${quote.id}\n\n` +
                     `👤 Usuario: ${quote.User.chatId}\n` +
                     `📝 Detalles: ${quote.details}\n\n` +
                     `¿Qué deseas hacer?`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '✅ Aprobar', callback_data: `admin_approve_${quoteId}` }],
          [{ text: '❌ Rechazar', callback_data: `admin_reject_${quoteId}` }],
          [{ text: t(user.language, 'back'), callback_data: 'admin_pending_quotes' }]
        ]
      };

      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard
      });
    }

    // Admin: approve quote
    else if (data.startsWith('admin_approve_')) {
      const quoteId = parseInt(data.split('_')[2]);
      userSessions.set(chatId, { action: 'admin_set_price', quoteId });

      bot.editMessageText(t(user.language, 'setPrice'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'cancel'), callback_data: 'admin_pending_quotes' }]]
        }
      });
    }

    // Admin: reject quote
    else if (data.startsWith('admin_reject_')) {
      const quoteId = parseInt(data.split('_')[2]);
      const quote = await Cotization.findByPk(quoteId, { include: [{ model: User }] });

      await quote.update({ status: 'rejected' });

      // Notify user
      bot.sendMessage(quote.User.chatId, `❌ Tu cotización ha sido rechazada.\n\n📝 Detalles: ${quote.details}`);

      bot.editMessageText(t(user.language, 'quoteRejected'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'back'), callback_data: 'admin_pending_quotes' }]]
        }
      });
    }

    // Admin: pending bookings
    else if (data === 'admin_pending_bookings') {
      const bookings = await Booking.findAll({
        where: { status: 'pending' },
        include: [{ model: User }, { model: Cotization }]
      });

      if (bookings.length === 0) {
        bot.answerCallbackQuery(query.id, { text: t(user.language, 'noPendingBookings'), show_alert: true });
        return;
      }

      const keyboard = {
        inline_keyboard: bookings.map(booking => [
          {
            text: `${booking.User.chatId}: ${new Date(booking.date).toLocaleDateString()} ${booking.time}`,
            callback_data: `admin_booking_${booking.id}`
          }
        ])
      };
      keyboard.inline_keyboard.push([{ text: t(user.language, 'back'), callback_data: 'admin_panel' }]);

      bot.editMessageText('📅 Citas Pendientes:', {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard
      });
    }

    // Admin: view booking details
    else if (data.startsWith('admin_booking_')) {
      const bookingId = parseInt(data.split('_')[2]);
      const booking = await Booking.findByPk(bookingId, {
        include: [{ model: User }, { model: Cotization }]
      });

      const message = `📅 Cita #${booking.id}\n\n` +
                     `👤 Usuario: ${booking.User.chatId}\n` +
                     `📝 Servicio: ${booking.Cotization.details}\n` +
                     `💰 Precio: $${parseFloat(booking.Cotization.price).toLocaleString()}\n` +
                     `📅 Fecha: ${new Date(booking.date).toLocaleDateString()}\n` +
                     `⏰ Hora: ${booking.time}\n\n` +
                     `¿Qué deseas hacer?`;

      const keyboard = {
        inline_keyboard: [
          [{ text: '✅ Confirmar', callback_data: `admin_confirm_booking_${bookingId}` }],
          [{ text: '❌ Cancelar', callback_data: `admin_cancel_booking_${bookingId}` }],
          [{ text: t(user.language, 'back'), callback_data: 'admin_pending_bookings' }]
        ]
      };

      bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: keyboard
      });
    }

    // Admin: confirm booking
    else if (data.startsWith('admin_confirm_booking_')) {
      const bookingId = parseInt(data.split('_')[3]);
      const booking = await Booking.findByPk(bookingId, {
        include: [{ model: User }, { model: Cotization }]
      });

      await booking.update({ status: 'confirmed' });

      // Get payment link
      const adminConfig = await Admin.findOne({ where: { userId: user.id } });
      const paymentLink = adminConfig?.paymentLink || 'No configurado';

      // Notify user
      const userLang = booking.User.language;
      const notification = `✅ ¡Tu cita ha sido confirmada!\n\n` +
                          `📝 Servicio: ${booking.Cotization.details}\n` +
                          `💰 Precio: $${parseFloat(booking.Cotization.price).toLocaleString()}\n` +
                          `📅 Fecha: ${new Date(booking.date).toLocaleDateString()}\n` +
                          `⏰ Hora: ${booking.time}\n\n` +
                          `💳 Link de pago: ${paymentLink}`;

      bot.sendMessage(booking.User.chatId, notification);

      bot.editMessageText(t(user.language, 'bookingConfirmed'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'back'), callback_data: 'admin_pending_bookings' }]]
        }
      });
    }

    // Admin: cancel booking
    else if (data.startsWith('admin_cancel_booking_')) {
      const bookingId = parseInt(data.split('_')[3]);
      const booking = await Booking.findByPk(bookingId, {
        include: [{ model: User }, { model: Cotization }]
      });

      await booking.update({ status: 'cancelled' });

      // Notify user
      bot.sendMessage(booking.User.chatId,
        `❌ Tu cita para ${new Date(booking.date).toLocaleDateString()} a las ${booking.time} ha sido cancelada.`);

      bot.editMessageText(t(user.language, 'bookingCancelled'), {
        chat_id: chatId,
        message_id: messageId,
        reply_markup: {
          inline_keyboard: [[{ text: t(user.language, 'back'), callback_data: 'admin_pending_bookings' }]]
        }
      });
    }

    bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Error in callback query:', error);
    bot.answerCallbackQuery(query.id, { text: 'Error occurred', show_alert: true });
  }
});

// Handle text messages
bot.on('message', async (msg) => {
  if (msg.text && msg.text.startsWith('/')) return; // Ignore commands

  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    const user = await getOrCreateUser(chatId);
    const session = userSessions.get(chatId);

    if (!session) return;

    // Request quote
    if (session.action === 'request_quote') {
      await Cotization.create({
        userId: user.id,
        details: text,
        price: 0,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending'
      });

      userSessions.delete(chatId);

      bot.sendMessage(chatId, t(user.language, 'quoteRequested'));
      showMainMenu(chatId, user);
    }

    // Booking date
    else if (session.action === 'booking_date') {
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = text.match(dateRegex);

      if (!match) {
        bot.sendMessage(chatId, t(user.language, 'invalidFormat'));
        return;
      }

      const [, day, month, year] = match;
      const date = new Date(year, month - 1, day);

      session.date = date;
      session.action = 'booking_time';
      userSessions.set(chatId, session);

      bot.sendMessage(chatId, t(user.language, 'selectTime'));
    }

    // Booking time
    else if (session.action === 'booking_time') {
      const timeRegex = /^(\d{2}):(\d{2})$/;
      const match = text.match(timeRegex);

      if (!match) {
        bot.sendMessage(chatId, t(user.language, 'invalidFormat'));
        return;
      }

      await Booking.create({
        userId: user.id,
        cotizationId: session.quoteId,
        date: session.date,
        time: text,
        status: 'pending'
      });

      userSessions.delete(chatId);

      bot.sendMessage(chatId, t(user.language, 'bookingCreated'));
      showMainMenu(chatId, user);
    }

    // Admin set price
    else if (session.action === 'admin_set_price') {
      const price = parseFloat(text);

      if (isNaN(price)) {
        bot.sendMessage(chatId, t(user.language, 'invalidFormat'));
        return;
      }

      const quote = await Cotization.findByPk(session.quoteId, { include: [{ model: User }] });
      await quote.update({ price, status: 'accepted' });

      // Notify user
      const userLang = quote.User.language;
      const notification = `✅ ¡Tu cotización ha sido aprobada!\n\n` +
                          `📝 Detalles: ${quote.details}\n` +
                          `💰 Precio: $${parseFloat(price).toLocaleString()}\n` +
                          `📅 Válida hasta: ${new Date(quote.expiryDate).toLocaleDateString()}`;

      bot.sendMessage(quote.User.chatId, notification);

      userSessions.delete(chatId);

      bot.sendMessage(chatId, t(user.language, 'quoteApproved'));
      showAdminPanel(chatId, user);
    }
  } catch (error) {
    console.error('Error handling message:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again.');
  }
});

// Initialize database and start bot
async function init() {
  try {
    await sequelize.sync();
    console.log('✅ Database synchronized');
    console.log('🤖 Bot started successfully!');
    console.log('💡 Use /start to begin');
  } catch (error) {
    console.error('❌ Failed to initialize:', error);
    process.exit(1);
  }
}

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down bot...');
  await sequelize.close();
  process.exit(0);
});

init();
