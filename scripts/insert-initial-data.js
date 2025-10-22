const { sequelize, syncDatabase } = require('../config/database');
const Property = require('../models/Property');
const Gallery = require('../models/Gallery');

// Datos iniciales de propiedades basadas en el landing page
const initialProperties = [
  {
    titulo: 'Casa en Colonia Aventura Morelos',
    descripcion: 'Hermosa casa con jardín y alberca en una zona residencial exclusiva.',
    tipo: 'venta',
    precio: 4200000.00,
    tag: 'Exclusiva',
    recamaras: 4,
    banos: 3,
    jardin: true,
    terraza: true,
    alberca: true,
    lote_m2: 350.00,
    pisos: 2,
    construccion_m2: 280.00,
    estacionamiento: 2,
    anios: 5,
    direccion: 'Colonia Aventura, Morelos',
    latitud: 19.4326,
    longitud: -99.1332,
    estado: 'activa'
  },
  {
    titulo: 'Departamento en la Roma Norte CDMX',
    descripcion: 'Moderno departamento en el corazón de la Roma Norte, cerca de restaurantes y cafés.',
    tipo: 'renta',
    precio: 45000.00,
    tag: 'Moderno',
    recamaras: 2,
    banos: 2,
    jardin: false,
    terraza: true,
    alberca: false,
    lote_m2: 0.00,
    pisos: 1,
    construccion_m2: 85.00,
    estacionamiento: 1,
    anios: 2,
    direccion: 'Roma Norte, Ciudad de México',
    latitud: 19.4194,
    longitud: -99.1556,
    estado: 'activa'
  },
  {
    titulo: 'Casa con Vista al Mar en Acapulco',
    descripcion: 'Increíble casa con vista panorámica al océano Pacífico.',
    tipo: 'venta',
    precio: 8500000.00,
    tag: 'Vista al Mar',
    recamaras: 5,
    banos: 4,
    jardin: true,
    terraza: true,
    alberca: true,
    lote_m2: 500.00,
    pisos: 3,
    construccion_m2: 450.00,
    estacionamiento: 3,
    anios: 8,
    direccion: 'Acapulco, Guerrero',
    latitud: 16.8531,
    longitud: -99.8237,
    estado: 'activa'
  }
];

// Imágenes de ejemplo para las propiedades
const initialImages = [
  {
    property_id: 1,
    imagen_url: '/assets/images/c1.png',
    orden: 1
  },
  {
    property_id: 1,
    imagen_url: '/assets/images/c2.png',
    orden: 2
  },
  {
    property_id: 1,
    imagen_url: '/assets/images/c3.png',
    orden: 3
  },
  {
    property_id: 2,
    imagen_url: '/assets/images/c4.png',
    orden: 1
  },
  {
    property_id: 2,
    imagen_url: '/assets/images/c5.png',
    orden: 2
  },
  {
    property_id: 2,
    imagen_url: '/assets/images/c6.png',
    orden: 3
  },
  {
    property_id: 3,
    imagen_url: '/assets/images/p1.png',
    orden: 1
  },
  {
    property_id: 3,
    imagen_url: '/assets/images/p2.png',
    orden: 2
  },
  {
    property_id: 3,
    imagen_url: '/assets/images/p3.png',
    orden: 3
  }
];

async function insertInitialData() {
  try {
    console.log('🚀 Iniciando inserción de datos iniciales...');

    // Sincronizar base de datos primero
    console.log('🔄 Sincronizando base de datos...');
    await syncDatabase();
    console.log('✅ Base de datos sincronizada');

    // Verificar si ya existen propiedades
    const existingProperties = await Property.count();
    if (existingProperties > 0) {
      console.log('⚠️  Ya existen propiedades en la base de datos. Saltando inserción.');
      return;
    }

    // Insertar propiedades
    console.log('📝 Insertando propiedades...');
    for (const propertyData of initialProperties) {
      const property = await Property.create(propertyData);
      console.log(`✅ Propiedad creada: ${property.titulo} (ID: ${property.id})`);
    }

    // Insertar imágenes
    console.log('🖼️  Insertando imágenes...');
    for (const imageData of initialImages) {
      await Gallery.create(imageData);
    }

    console.log('✅ Datos iniciales insertados exitosamente');
    console.log(`📊 Total de propiedades: ${initialProperties.length}`);
    console.log(`🖼️  Total de imágenes: ${initialImages.length}`);

  } catch (error) {
    console.error('❌ Error insertando datos iniciales:', error);
  } finally {
    await sequelize.close();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  insertInitialData();
}

module.exports = { insertInitialData };
