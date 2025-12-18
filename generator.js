const { sequelize, User, Cotization, Booking, Admin, Service } = require('./src/models');

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

    // Crear servicios de prueba
    const services = await Service.bulkCreate([
      {
        name: 'Trenzas Africanas Clásicas',
        description: 'Trenzas africanas tradicionales, perfectas para un look elegante y duradero.',
        price: 120000,
        duration: 180,
        category: 'braids',
        isActive: true,
      },
      {
        name: 'Trenzas Box Braids',
        description: 'Box braids medianas, ideales para cualquier ocasión.',
        price: 150000,
        duration: 240,
        category: 'braids',
        isActive: true,
      },
      {
        name: 'Trenzas Knotless',
        description: 'Trenzas sin nudo, más naturales y menos tensión en el cuero cabelludo.',
        price: 180000,
        duration: 300,
        category: 'braids',
        isActive: true,
      },
      {
        name: 'Cornrows',
        description: 'Trenzas pegadas al cuero cabelludo con diseños personalizados.',
        price: 100000,
        duration: 120,
        category: 'braids',
        isActive: true,
      },
      {
        name: 'Mantenimiento de Trenzas',
        description: 'Retoque y mantenimiento de trenzas existentes.',
        price: 60000,
        duration: 90,
        category: 'maintenance',
        isActive: true,
      },
    ]);
    console.log('Servicios de prueba creados.');

    // Crear cotizaciones de prueba
    const cotizations = await Cotization.bulkCreate([
      {
        userId: users[0].id,
        serviceId: services[1].id,
        details: 'Box braids medianas, color natural',
        price: 150000,
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días a partir de ahora
        status: 'accepted',
      },
      {
        userId: users[1].id,
        serviceId: services[3].id,
        details: 'Cornrows con diseño personalizado',
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
        serviceId: services[1].id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 días a partir de ahora
        time: '10:00',
        status: 'confirmed',
      },
      {
        userId: users[1].id,
        cotizationId: cotizations[1].id,
        serviceId: services[3].id,
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
