// Configuración simplificada de base de datos para desarrollo
const { Sequelize } = require('sequelize');
const config = require('../config');

// Configuración de la base de datos MySQL
const sequelize = new Sequelize(
  config.database.name,
  config.database.user,
  config.database.password,
  {
    host: config.database.host,
    port: config.database.port,
    dialect: 'mysql',
    logging: console.log, // Mostrar consultas SQL
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    },
    dialectOptions: {
      // Configuración adicional para desarrollo
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    }
  }
);

// Función para probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a MySQL');
    console.log(`📊 Base de datos: ${config.database.name}`);
    console.log(`🏠 Host: ${config.database.host}:${config.database.port}`);
    return true;
  } catch (error) {
    console.error('❌ Error conectando a MySQL:', error.message);
    console.log('💡 Asegúrate de que MySQL esté ejecutándose y la base de datos exista');
    console.log('💡 Comando para crear base de datos: CREATE DATABASE crissvargas;');
    return false;
  }
};

// Función para sincronizar modelos
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force });
    console.log('✅ Base de datos sincronizada');
    console.log('📋 Tablas creadas: users, magic_codes');
    return true;
  } catch (error) {
    console.error('❌ Error sincronizando base de datos:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};
