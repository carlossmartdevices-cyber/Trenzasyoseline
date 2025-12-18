module.exports = {
  // Welcome and onboarding
  welcome: '¡Bienvenido/a a Trenzas y Oseline! 🌟\n\nSomos especialistas en trenzas africanas y peinados personalizados.\n\n¿En qué idioma te gustaría continuar?',
  language_selected: 'Idioma seleccionado: Español 🇪🇸',
  select_gender: 'Por favor, selecciona tu género:',
  gender_selected: 'Género seleccionado: {{gender}}',
  terms_and_conditions: '📋 Términos y Condiciones\n\nAl usar este bot aceptas:\n\n1. Proporcionar información veraz\n2. Respetar los horarios de las citas\n3. Cancelar con al menos 24 horas de anticipación\n4. Realizar el pago según lo acordado\n\n¿Aceptas estos términos?',
  terms_accepted: '✅ Términos aceptados. ¡Bienvenido/a!',
  registration_complete: '¡Registro completado! Ya puedes usar el bot.',

  // Main menu
  main_menu: '📱 Menú Principal',
  menu_services: '💇 Ver Servicios',
  menu_quote: '💰 Solicitar Cotización',
  menu_bookings: '📅 Mis Reservas',
  menu_help: '❓ Ayuda',
  menu_settings: '⚙️ Configuración',
  menu_admin: '👑 Panel Admin',

  // Services
  services_title: '💇 Nuestros Servicios',
  service_details: '{{name}}\n\n{{description}}\n\n💰 Precio: ${{price}} COP\n⏱️ Duración: {{duration}} min',
  no_services: 'No hay servicios disponibles en este momento.',
  back_to_menu: '⬅️ Volver al Menú',

  // Quotes
  quote_request: '💰 Solicitar Cotización\n\nPor favor, describe el servicio que necesitas:',
  quote_received: '✅ Solicitud de cotización recibida.\n\nNuestro equipo te enviará una cotización personalizada pronto.',
  quote_created: '📝 Nueva cotización creada:\n\nDetalles: {{details}}\n💰 Precio: ${{price}} COP\n📅 Válida hasta: {{expiryDate}}',
  quote_accepted: '✅ Cotización aceptada. Ahora puedes agendar una cita.',
  quote_rejected: '❌ Cotización rechazada.',
  quote_expired: '⏰ Esta cotización ha expirado.',
  my_quotes: '💰 Mis Cotizaciones',
  no_quotes: 'No tienes cotizaciones.',
  quote_status: 'Estado: {{status}}',

  // Bookings
  booking_request: '📅 Agendar Cita\n\nPor favor, selecciona una fecha:',
  select_time: 'Selecciona una hora:',
  booking_created: '✅ Cita agendada exitosamente!\n\n📅 Fecha: {{date}}\n⏰ Hora: {{time}}\n\nTe enviaremos un recordatorio antes de tu cita.',
  booking_confirmed: '✅ Cita confirmada.',
  booking_cancelled: '❌ Cita cancelada.',
  my_bookings: '📅 Mis Reservas',
  no_bookings: 'No tienes reservas.',
  booking_reminder: '⏰ Recordatorio: Tienes una cita mañana a las {{time}}.',
  booking_status: 'Estado: {{status}}',
  confirm_booking: '✅ Confirmar',
  cancel_booking: '❌ Cancelar',

  // Payment
  payment_required: '💳 Pago Requerido\n\nPrecio: ${{price}} COP\n\nPor favor, realiza el pago usando el siguiente enlace:',
  payment_button: '💳 Pagar Ahora',
  payment_received: '✅ Pago recibido. ¡Gracias!',

  // Admin
  admin_panel: '👑 Panel de Administración',
  admin_quotes: '💰 Gestionar Cotizaciones',
  admin_bookings: '📅 Gestionar Reservas',
  admin_services: '💇 Gestionar Servicios',
  admin_settings: '⚙️ Configuración',
  admin_stats: '📊 Estadísticas',
  pending_quotes: '📝 Cotizaciones Pendientes:',
  pending_bookings: '📅 Reservas Pendientes:',
  create_quote_for: 'Crear cotización para el usuario {{chatId}}:',
  quote_price: 'Ingresa el precio (solo números):',
  quote_details: 'Ingresa los detalles del servicio:',

  // Settings
  settings_menu: '⚙️ Configuración',
  change_language: '🌐 Cambiar Idioma',
  change_gender: '👤 Cambiar Género',
  notifications: '🔔 Notificaciones',
  delete_account: '🗑️ Eliminar Cuenta',

  // Help
  help_message: '❓ Ayuda\n\n¿Necesitas ayuda? Aquí está cómo usar el bot:\n\n1. 💇 Ver servicios disponibles\n2. 💰 Solicitar una cotización personalizada\n3. 📅 Agendar una cita\n4. 💳 Realizar el pago\n\nContacto:\n📞 {{phone}}\n📍 {{address}}\n🕐 {{hours}}',

  // Gender options
  male: 'Masculino',
  female: 'Femenino',
  other: 'Otro',

  // Common
  yes: 'Sí',
  no: 'No',
  accept: 'Aceptar',
  reject: 'Rechazar',
  cancel: 'Cancelar',
  confirm: 'Confirmar',
  back: 'Atrás',
  next: 'Siguiente',
  send: 'Enviar',
  loading: 'Cargando...',

  // Errors
  error_generic: '❌ Ocurrió un error. Por favor, intenta de nuevo.',
  error_not_registered: '❌ No estás registrado. Usa /start para comenzar.',
  error_admin_only: '❌ Este comando es solo para administradores.',
  error_invalid_input: '❌ Entrada inválida. Por favor, intenta de nuevo.',
  error_no_active_quote: '❌ No tienes una cotización activa.',
  error_booking_conflict: '❌ Este horario no está disponible.',

  // Status
  status_pending: 'Pendiente',
  status_confirmed: 'Confirmada',
  status_cancelled: 'Cancelada',
  status_completed: 'Completada',
  status_accepted: 'Aceptada',
  status_rejected: 'Rechazada',
  status_expired: 'Expirada',
};
