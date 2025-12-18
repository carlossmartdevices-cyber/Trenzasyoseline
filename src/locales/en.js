module.exports = {
  // Welcome and onboarding
  welcome: 'Welcome to Trenzas y Oseline! 🌟\n\nWe specialize in African braids and personalized hairstyles.\n\nWhich language would you like to continue in?',
  language_selected: 'Language selected: English 🇬🇧',
  select_gender: 'Please select your gender:',
  gender_selected: 'Gender selected: {{gender}}',
  terms_and_conditions: '📋 Terms and Conditions\n\nBy using this bot you agree to:\n\n1. Provide truthful information\n2. Respect appointment schedules\n3. Cancel at least 24 hours in advance\n4. Make payment as agreed\n\nDo you accept these terms?',
  terms_accepted: '✅ Terms accepted. Welcome!',
  registration_complete: 'Registration complete! You can now use the bot.',

  // Main menu
  main_menu: '📱 Main Menu',
  menu_services: '💇 View Services',
  menu_quote: '💰 Request Quote',
  menu_bookings: '📅 My Bookings',
  menu_help: '❓ Help',
  menu_settings: '⚙️ Settings',
  menu_admin: '👑 Admin Panel',

  // Services
  services_title: '💇 Our Services',
  service_details: '{{name}}\n\n{{description}}\n\n💰 Price: ${{price}} COP\n⏱️ Duration: {{duration}} min',
  no_services: 'No services available at the moment.',
  back_to_menu: '⬅️ Back to Menu',

  // Quotes
  quote_request: '💰 Request Quote\n\nPlease describe the service you need:',
  quote_received: '✅ Quote request received.\n\nOur team will send you a personalized quote soon.',
  quote_created: '📝 New quote created:\n\nDetails: {{details}}\n💰 Price: ${{price}} COP\n📅 Valid until: {{expiryDate}}',
  quote_accepted: '✅ Quote accepted. You can now schedule an appointment.',
  quote_rejected: '❌ Quote rejected.',
  quote_expired: '⏰ This quote has expired.',
  my_quotes: '💰 My Quotes',
  no_quotes: 'You have no quotes.',
  quote_status: 'Status: {{status}}',

  // Bookings
  booking_request: '📅 Schedule Appointment\n\nPlease select a date:',
  select_time: 'Select a time:',
  booking_created: '✅ Appointment scheduled successfully!\n\n📅 Date: {{date}}\n⏰ Time: {{time}}\n\nWe will send you a reminder before your appointment.',
  booking_confirmed: '✅ Appointment confirmed.',
  booking_cancelled: '❌ Appointment cancelled.',
  my_bookings: '📅 My Bookings',
  no_bookings: 'You have no bookings.',
  booking_reminder: '⏰ Reminder: You have an appointment tomorrow at {{time}}.',
  booking_status: 'Status: {{status}}',
  confirm_booking: '✅ Confirm',
  cancel_booking: '❌ Cancel',

  // Payment
  payment_required: '💳 Payment Required\n\nPrice: ${{price}} COP\n\nPlease make the payment using the following link:',
  payment_button: '💳 Pay Now',
  payment_received: '✅ Payment received. Thank you!',

  // Admin
  admin_panel: '👑 Admin Panel',
  admin_quotes: '💰 Manage Quotes',
  admin_bookings: '📅 Manage Bookings',
  admin_services: '💇 Manage Services',
  admin_settings: '⚙️ Settings',
  admin_stats: '📊 Statistics',
  pending_quotes: '📝 Pending Quotes:',
  pending_bookings: '📅 Pending Bookings:',
  create_quote_for: 'Create quote for user {{chatId}}:',
  quote_price: 'Enter the price (numbers only):',
  quote_details: 'Enter the service details:',

  // Settings
  settings_menu: '⚙️ Settings',
  change_language: '🌐 Change Language',
  change_gender: '👤 Change Gender',
  notifications: '🔔 Notifications',
  delete_account: '🗑️ Delete Account',

  // Help
  help_message: '❓ Help\n\nNeed help? Here\'s how to use the bot:\n\n1. 💇 View available services\n2. 💰 Request a personalized quote\n3. 📅 Schedule an appointment\n4. 💳 Make payment\n\nContact:\n📞 {{phone}}\n📍 {{address}}\n🕐 {{hours}}',

  // Gender options
  male: 'Male',
  female: 'Female',
  other: 'Other',

  // Common
  yes: 'Yes',
  no: 'No',
  accept: 'Accept',
  reject: 'Reject',
  cancel: 'Cancel',
  confirm: 'Confirm',
  back: 'Back',
  next: 'Next',
  send: 'Send',
  loading: 'Loading...',

  // Errors
  error_generic: '❌ An error occurred. Please try again.',
  error_not_registered: '❌ You are not registered. Use /start to begin.',
  error_admin_only: '❌ This command is for admins only.',
  error_invalid_input: '❌ Invalid input. Please try again.',
  error_no_active_quote: '❌ You don\'t have an active quote.',
  error_booking_conflict: '❌ This time slot is not available.',

  // Status
  status_pending: 'Pending',
  status_confirmed: 'Confirmed',
  status_cancelled: 'Cancelled',
  status_completed: 'Completed',
  status_accepted: 'Accepted',
  status_rejected: 'Rejected',
  status_expired: 'Expired',
};
