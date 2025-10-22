const Property = require('../models/Property');
const Gallery = require('../models/Gallery');

// Configurar asociaciones
Property.hasMany(Gallery, {
  foreignKey: 'property_id',
  as: 'gallery',
  onDelete: 'CASCADE'
});

Gallery.belongsTo(Property, {
  foreignKey: 'property_id',
  as: 'property'
});

module.exports = {
  Property,
  Gallery
};
