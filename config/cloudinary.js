const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Storage para Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'realstate/properties', // Carpeta en Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { 
        width: 1200, 
        height: 800, 
        crop: 'limit', // No recortar, solo limitar tamaño máximo
        quality: 'auto:good' // Optimización automática
      }
    ],
    resource_type: 'auto' // Detectar tipo automáticamente
  }
});

// Storage para imágenes de galería (más pequeñas)
const galleryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'realstate/gallery',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { 
        width: 800, 
        height: 600, 
        crop: 'limit',
        quality: 'auto:good'
      }
    ],
    resource_type: 'auto'
  }
});

module.exports = { 
  cloudinary, 
  storage, 
  galleryStorage 
};
