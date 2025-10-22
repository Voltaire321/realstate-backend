const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true, // Puede ser null para usuarios de Magic Link
    validate: {
      len: [6, 255]
    }
  },
  authMethod: {
    type: DataTypes.ENUM('password', 'magic_link'),
    defaultValue: 'password',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Hook para encriptar contraseña antes de guardar
User.beforeCreate(async (user) => {
  if (user.password) {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

// Hook para encriptar contraseña antes de actualizar
User.beforeUpdate(async (user) => {
  if (user.changed('password') && user.password) {
    const saltRounds = 10;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

// Método para verificar contraseña
User.prototype.validatePassword = async function(password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

// Método para actualizar último login
User.prototype.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

module.exports = User;
