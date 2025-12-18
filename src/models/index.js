const { Sequelize } = require('sequelize');

// Configurar Sequelize con SQLite
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false, // Desactivar logs de SQL
});

// Importar modelos
const User = require('./User')(sequelize);
const Cotization = require('./Cotization')(sequelize);
const Booking = require('./Booking')(sequelize);
const Admin = require('./Admin')(sequelize);
const Service = require('./Service')(sequelize);

// Definir relaciones
User.hasMany(Cotization, { foreignKey: 'userId', onDelete: 'CASCADE' });
Cotization.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Booking, { foreignKey: 'userId', onDelete: 'CASCADE' });
Booking.belongsTo(User, { foreignKey: 'userId' });

Cotization.hasMany(Booking, { foreignKey: 'cotizationId', onDelete: 'CASCADE' });
Booking.belongsTo(Cotization, { foreignKey: 'cotizationId' });

Service.hasMany(Cotization, { foreignKey: 'serviceId', onDelete: 'SET NULL' });
Cotization.belongsTo(Service, { foreignKey: 'serviceId' });

Service.hasMany(Booking, { foreignKey: 'serviceId', onDelete: 'SET NULL' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

module.exports = {
  sequelize,
  User,
  Cotization,
  Booking,
  Admin,
  Service,
};
