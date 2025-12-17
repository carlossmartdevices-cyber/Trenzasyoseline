const { sequelize, User, Cotization, Booking, Admin } = require('./src/models');

async function generateData() {
  try {
    // Sincronizar la base de datos
    await sequelize.sync({ force: true });
    console.log('Base de datos sincronizada.');

    // Crear usuarios de prueba
    const users = await User.bulkCreate([
      {
        chatId: '123456789',
        language: 'Español',
        gender: 'Femenino',
        acceptedTerms: true,
      },
      {
        chatId: '987654321',
        language: 'English',
        gender: 'Male',
        acceptedTerms: true,
      },
    ]);
    console.log('Usuarios de prueba creados.');

    // Crear cotizaciones de prueba
    const cotizations = await Cotization.bulkCreate([
      {
        userId: users[0].id,
        details: 'Trenzas africanas para mujer',
        price: 150000,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días a partir de ahora
        status: 'pending',
      },
      {
        userId: users[1].id,
        details: 'Trenzas africanas para hombre',
        price: 120000,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días a partir de ahora
        status: 'pending',
      },
    ]);
    console.log('Cotizaciones de prueba creadas.');

    // Crear reservas de prueba
    const bookings = await Booking.bulkCreate([
      {
        userId: users[0].id,
        cotizationId: cotizations[0].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días a partir de ahora
        time: '10:00',
        status: 'pending',
      },
      {
        userId: users[1].id,
        cotizationId: cotizations[1].id,
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días a partir de ahora
        time: '14:00',
        status: 'pending',
      },
    ]);
    console.log('Reservas de prueba creadas.');

    // Crear configuración de admin de prueba
    const admin = await Admin.create({
      userId: 1, // ID de un usuario admin de prueba
      paymentLink: 'https://nequi.com.co/payment-link',
    });
    console.log('Configuración de admin de prueba creada.');

    console.log('Datos de prueba generados correctamente.');
  } catch (error) {
    console.error('Error al generar datos de prueba:', error);
  } finally {
    // Cerrar la conexión a la base de datos
    await sequelize.close();
  }
}

// Ejecutar el generador de datos
generateData();
