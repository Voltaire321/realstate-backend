const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const MagicCode = sequelize.define('MagicCode', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  code: {
    type: DataTypes.STRING(5),
    allowNull: false,
    validate: {
      len: [5, 5]
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  }
}, {
  tableName: 'magic_codes',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Método para verificar si el código es válido
MagicCode.prototype.isValid = function() {
  return !this.used && this.expiresAt > new Date();
};

// Método para marcar como usado
MagicCode.prototype.markAsUsed = async function() {
  this.used = true;
  await this.save();
};

// Método estático para limpiar códigos expirados
MagicCode.cleanExpiredCodes = async function() {
  try {
    const result = await MagicCode.destroy({
      where: {
        [sequelize.Op.or]: [
          { used: true },
          { expiresAt: { [sequelize.Op.lt]: new Date() } }
        ]
      }
    });
    console.log(`🧹 Limpiados ${result} códigos expirados`);
    return result;
  } catch (error) {
    console.error('Error limpiando códigos expirados:', error);
    return 0;
  }
};

module.exports = MagicCode;
