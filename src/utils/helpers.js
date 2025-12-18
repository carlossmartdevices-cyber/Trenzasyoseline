const moment = require('moment-timezone');

// Set timezone for Colombia
const TIMEZONE = 'America/Bogota';
moment.tz.setDefault(TIMEZONE);

/**
 * Format currency in Colombian Pesos
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date
 */
function formatDate(date) {
  return moment(date).format('DD/MM/YYYY');
}

/**
 * Format datetime
 */
function formatDateTime(date) {
  return moment(date).format('DD/MM/YYYY HH:mm');
}

/**
 * Get date from now
 */
function getDateFromNow(days) {
  return moment().add(days, 'days').toDate();
}

/**
 * Check if user is admin
 */
function isAdmin(chatId) {
  const adminChatIds = (process.env.ADMIN_CHAT_IDS || '').split(',').map(id => id.trim());
  return adminChatIds.includes(String(chatId));
}

/**
 * Generate available time slots for a given date
 */
function generateTimeSlots() {
  const slots = [];
  const startHour = parseInt(process.env.BOOKING_START_HOUR || 9);
  const endHour = parseInt(process.env.BOOKING_END_HOUR || 18);
  const duration = parseInt(process.env.BOOKING_SLOT_DURATION || 120); // in minutes

  for (let hour = startHour; hour < endHour; hour += duration / 60) {
    const time = moment().hour(Math.floor(hour)).minute((hour % 1) * 60).format('HH:mm');
    slots.push(time);
  }

  return slots;
}

/**
 * Check if a booking date is valid
 */
function isValidBookingDate(date) {
  const bookingDate = moment(date);
  const now = moment();
  const minDays = parseInt(process.env.BOOKING_ADVANCE_DAYS || 1);
  const maxDays = parseInt(process.env.BOOKING_MAX_DAYS || 30);

  const minDate = now.clone().add(minDays, 'days');
  const maxDate = now.clone().add(maxDays, 'days');

  return bookingDate.isBetween(minDate, maxDate, 'day', '[]');
}

/**
 * Generate calendar keyboard for date selection
 */
function generateCalendar(year, month) {
  const firstDay = moment({ year, month: month - 1, day: 1 });
  const daysInMonth = firstDay.daysInMonth();
  const startDay = firstDay.day(); // 0 = Sunday

  const calendar = [];
  const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  // Add weekday headers
  calendar.push(weekDays.map(day => ({ text: day, callback_data: 'ignore' })));

  let week = [];

  // Add empty cells for days before month starts
  for (let i = 0; i < startDay; i++) {
    week.push({ text: ' ', callback_data: 'ignore' });
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = moment({ year, month: month - 1, day });
    const isValid = isValidBookingDate(date);

    week.push({
      text: isValid ? String(day) : '✗',
      callback_data: isValid ? `date:${date.format('YYYY-MM-DD')}` : 'ignore'
    });

    if (week.length === 7) {
      calendar.push(week);
      week = [];
    }
  }

  // Fill the last week if needed
  while (week.length > 0 && week.length < 7) {
    week.push({ text: ' ', callback_data: 'ignore' });
  }
  if (week.length > 0) {
    calendar.push(week);
  }

  // Add navigation buttons
  calendar.push([
    { text: '◀️ Anterior', callback_data: `cal:${year}:${month - 1}` },
    { text: `${firstDay.format('MMMM YYYY')}`, callback_data: 'ignore' },
    { text: 'Siguiente ▶️', callback_data: `cal:${year}:${month + 1}` }
  ]);

  return calendar;
}

module.exports = {
  formatCurrency,
  formatDate,
  formatDateTime,
  getDateFromNow,
  isAdmin,
  generateTimeSlots,
  isValidBookingDate,
  generateCalendar,
  TIMEZONE,
};
