const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tipo: {
    type: DataTypes.ENUM('venta', 'renta'),
    allowNull: false
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  tag: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  recamaras: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  banos: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  jardin: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  terraza: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  alberca: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false
  },
  lote_m2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  pisos: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  construccion_m2: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  estacionamiento: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  anios: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0
  },
  direccion: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  latitud: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true
  },
  longitud: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true
  },
  estado: {
    type: DataTypes.ENUM('activa', 'inactiva', 'eliminada'),
    defaultValue: 'activa',
    allowNull: false
  }
}, {
  tableName: 'properties',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Property;
