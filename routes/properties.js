const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

const { Property, Gallery } = require('../config/associations');

const router = express.Router();

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos JPG y PNG'));
    }
  }
});

// GET /api/properties/public - Listar propiedades activas (sin autenticación)
router.get('/public', async (req, res) => {
  try {
    const properties = await Property.findAll({
      where: { estado: 'activa' },
      include: [{
        model: Gallery,
        as: 'gallery',
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    // Formatear respuesta
    const formattedProperties = properties.map(property => {
      const gallery = property.gallery || [];
      return {
        id: property.id,
        titulo: property.titulo,
        descripcion: property.descripcion,
        tipo: property.tipo,
        precio: parseFloat(property.precio),
        tag: property.tag,
        recamaras: property.recamaras,
        banos: property.banos,
        jardin: property.jardin,
        terraza: property.terraza,
        alberca: property.alberca,
        lote_m2: property.lote_m2 ? parseFloat(property.lote_m2) : null,
        pisos: property.pisos,
        construccion_m2: property.construccion_m2 ? parseFloat(property.construccion_m2) : null,
        estacionamiento: property.estacionamiento,
        anios: property.anios,
        direccion: property.direccion,
        latitud: property.latitud ? parseFloat(property.latitud) : null,
        longitud: property.longitud ? parseFloat(property.longitud) : null,
        estado: property.estado,
        created_at: property.created_at,
        updated_at: property.updated_at,
        gallery: gallery.map(img => ({
          id: img.id,
          imagen_url: img.imagen_url,
          orden: img.orden
        }))
      };
    });

    res.json({
      success: true,
      data: formattedProperties,
      total: formattedProperties.length
    });
  } catch (error) {
    console.error('Error listando propiedades públicas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// GET /api/properties - Listar todas las propiedades
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { estado = 'activa' } = req.query;
    
    const properties = await Property.findAll({
      where: { estado },
      include: [{
        model: Gallery,
        as: 'gallery',
        required: false
      }],
      order: [['created_at', 'DESC']]
    });

    // Formatear respuesta
    const formattedProperties = properties.map(property => {
      const gallery = property.gallery || [];
      return {
        id: property.id,
        titulo: property.titulo,
        descripcion: property.descripcion,
        tipo: property.tipo,
        precio: parseFloat(property.precio),
        tag: property.tag,
        recamaras: property.recamaras,
        banos: property.banos,
        jardin: property.jardin,
        terraza: property.terraza,
        alberca: property.alberca,
        lote_m2: property.lote_m2 ? parseFloat(property.lote_m2) : null,
        pisos: property.pisos,
        construccion_m2: property.construccion_m2 ? parseFloat(property.construccion_m2) : null,
        estacionamiento: property.estacionamiento,
        anios: property.anios,
        direccion: property.direccion,
        latitud: property.latitud ? parseFloat(property.latitud) : null,
        longitud: property.longitud ? parseFloat(property.longitud) : null,
        estado: property.estado,
        created_at: property.created_at,
        updated_at: property.updated_at,
        imagen_principal: gallery.length > 0 ? gallery[0].imagen_url : null,
        total_imagenes: gallery.length,
        imagenes_adicionales: gallery.length > 1 ? gallery.length - 1 : 0
      };
    });

    res.json({
      success: true,
      data: formattedProperties,
      total: formattedProperties.length
    });
  } catch (error) {
    console.error('Error listando propiedades:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// GET /api/properties/public/:id - Obtener una propiedad por ID (sin autenticación)
router.get('/public/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findByPk(id, {
      include: [{
        model: Gallery,
        as: 'gallery',
        required: false
      }]
    });

    if (!property || property.estado !== 'activa') {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    const gallery = property.gallery || [];
    const formattedProperty = {
      id: property.id,
      titulo: property.titulo,
      descripcion: property.descripcion,
      tipo: property.tipo,
      precio: parseFloat(property.precio),
      tag: property.tag,
      recamaras: property.recamaras,
      banos: property.banos,
      jardin: property.jardin,
      terraza: property.terraza,
      alberca: property.alberca,
      lote_m2: property.lote_m2 ? parseFloat(property.lote_m2) : null,
      pisos: property.pisos,
      construccion_m2: property.construccion_m2 ? parseFloat(property.construccion_m2) : null,
      estacionamiento: property.estacionamiento,
      anios: property.anios,
      direccion: property.direccion,
      latitud: property.latitud ? parseFloat(property.latitud) : null,
      longitud: property.longitud ? parseFloat(property.longitud) : null,
      estado: property.estado,
      created_at: property.created_at,
      updated_at: property.updated_at,
      gallery: gallery.map(img => ({
        id: img.id,
        imagen_url: img.imagen_url,
        orden: img.orden
      }))
    };

    res.json({
      success: true,
      data: formattedProperty
    });
  } catch (error) {
    console.error('Error obteniendo propiedad pública:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// GET /api/properties/:id - Obtener una propiedad por ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findByPk(id, {
      include: [{
        model: Gallery,
        as: 'gallery',
        required: false,
        order: [['orden', 'ASC']]
      }]
    });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    const gallery = property.gallery || [];
    const formattedProperty = {
      id: property.id,
      titulo: property.titulo,
      descripcion: property.descripcion,
      tipo: property.tipo,
      precio: parseFloat(property.precio),
      tag: property.tag,
      recamaras: property.recamaras,
      banos: property.banos,
      jardin: property.jardin,
      terraza: property.terraza,
      alberca: property.alberca,
      lote_m2: property.lote_m2 ? parseFloat(property.lote_m2) : null,
      pisos: property.pisos,
      construccion_m2: property.construccion_m2 ? parseFloat(property.construccion_m2) : null,
      estacionamiento: property.estacionamiento,
      anios: property.anios,
      direccion: property.direccion,
      latitud: property.latitud ? parseFloat(property.latitud) : null,
      longitud: property.longitud ? parseFloat(property.longitud) : null,
      estado: property.estado,
      created_at: property.created_at,
      updated_at: property.updated_at,
      gallery: gallery.map(img => ({
        id: img.id,
        imagen_url: img.imagen_url,
        orden: img.orden
      }))
    };

    res.json({
      success: true,
      data: formattedProperty
    });
  } catch (error) {
    console.error('Error obteniendo propiedad:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// POST /api/properties - Crear una nueva propiedad
router.post('/', authenticateToken, async (req, res) => {
  try {
    const propertyData = req.body;
    
    // Validar campos requeridos
    if (!propertyData.titulo || !propertyData.tipo || !propertyData.precio) {
      return res.status(400).json({
        success: false,
        message: 'Título, tipo y precio son campos requeridos'
      });
    }

    const property = await Property.create({
      titulo: propertyData.titulo,
      descripcion: propertyData.descripcion || null,
      tipo: propertyData.tipo,
      precio: propertyData.precio,
      tag: propertyData.tag || null,
      recamaras: propertyData.recamaras || 0,
      banos: propertyData.banos || 0,
      jardin: propertyData.jardin || false,
      terraza: propertyData.terraza || false,
      alberca: propertyData.alberca || false,
      lote_m2: propertyData.lote_m2 || null,
      pisos: propertyData.pisos || 0,
      construccion_m2: propertyData.construccion_m2 || null,
      estacionamiento: propertyData.estacionamiento || 0,
      anios: propertyData.anios || 0,
      direccion: propertyData.direccion || null,
      latitud: propertyData.latitud || null,
      longitud: propertyData.longitud || null,
      estado: 'activa'
    });

    res.status(201).json({
      success: true,
      message: 'Propiedad creada exitosamente',
      data: {
        id: property.id,
        titulo: property.titulo,
        tipo: property.tipo,
        precio: parseFloat(property.precio),
        estado: property.estado
      }
    });
  } catch (error) {
    console.error('Error creando propiedad:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// PUT /api/properties/:id - Editar una propiedad existente
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const propertyData = req.body;
    
    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    // Actualizar campos
    await property.update({
      titulo: propertyData.titulo || property.titulo,
      descripcion: propertyData.descripcion !== undefined ? propertyData.descripcion : property.descripcion,
      tipo: propertyData.tipo || property.tipo,
      precio: propertyData.precio || property.precio,
      tag: propertyData.tag !== undefined ? propertyData.tag : property.tag,
      recamaras: propertyData.recamaras !== undefined ? propertyData.recamaras : property.recamaras,
      banos: propertyData.banos !== undefined ? propertyData.banos : property.banos,
      jardin: propertyData.jardin !== undefined ? propertyData.jardin : property.jardin,
      terraza: propertyData.terraza !== undefined ? propertyData.terraza : property.terraza,
      alberca: propertyData.alberca !== undefined ? propertyData.alberca : property.alberca,
      lote_m2: propertyData.lote_m2 !== undefined ? propertyData.lote_m2 : property.lote_m2,
      pisos: propertyData.pisos !== undefined ? propertyData.pisos : property.pisos,
      construccion_m2: propertyData.construccion_m2 !== undefined ? propertyData.construccion_m2 : property.construccion_m2,
      estacionamiento: propertyData.estacionamiento !== undefined ? propertyData.estacionamiento : property.estacionamiento,
      anios: propertyData.anios !== undefined ? propertyData.anios : property.anios,
      direccion: propertyData.direccion !== undefined ? propertyData.direccion : property.direccion,
      latitud: propertyData.latitud !== undefined ? propertyData.latitud : property.latitud,
      longitud: propertyData.longitud !== undefined ? propertyData.longitud : property.longitud
    });

    res.json({
      success: true,
      message: 'Propiedad actualizada exitosamente',
      data: {
        id: property.id,
        titulo: property.titulo,
        tipo: property.tipo,
        precio: parseFloat(property.precio),
        estado: property.estado
      }
    });
  } catch (error) {
    console.error('Error actualizando propiedad:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// DELETE /api/properties/:id - Marcar como eliminada (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    await property.update({ estado: 'eliminada' });

    res.json({
      success: true,
      message: 'Propiedad eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando propiedad:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// PUT /api/properties/:id/reactivate - Reactivar propiedad eliminada
router.put('/:id/reactivate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    if (property.estado !== 'eliminada') {
      return res.status(400).json({
        success: false,
        message: 'La propiedad no está eliminada'
      });
    }

    await property.update({ estado: 'activa' });

    res.json({
      success: true,
      message: 'Propiedad reactivada exitosamente',
      data: {
        id: property.id,
        titulo: property.titulo,
        estado: property.estado
      }
    });
  } catch (error) {
    console.error('Error reactivando propiedad:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// DELETE /api/properties/:id/gallery/:imageId - Eliminar una imagen de la galería
router.delete('/:id/gallery/:imageId', authenticateToken, async (req, res) => {
  try {
    const { id, imageId } = req.params;

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    const image = await Gallery.findOne({
      where: {
        id: imageId,
        property_id: id
      }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Imagen no encontrada'
      });
    }

    // Eliminar el archivo físico del servidor
    const imagePath = path.join(__dirname, '..', image.imagen_url);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    // Eliminar el registro de la base de datos
    await image.destroy();

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// POST /api/properties/:id/gallery - Subir imágenes
router.post('/:id/gallery', authenticateToken, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se enviaron archivos'
      });
    }

    const property = await Property.findByPk(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Propiedad no encontrada'
      });
    }

    // Obtener el siguiente orden
    const lastImage = await Gallery.findOne({
      where: { property_id: id },
      order: [['orden', 'DESC']]
    });
    let nextOrder = lastImage ? lastImage.orden + 1 : 1;

    // Guardar imágenes en la base de datos
    const savedImages = [];
    for (const file of files) {
      const imageUrl = `/uploads/${file.filename}`;
      const galleryItem = await Gallery.create({
        property_id: id,
        imagen_url: imageUrl,
        orden: nextOrder++
      });
      savedImages.push(galleryItem);
    }

    res.json({
      success: true,
      message: 'Imágenes subidas exitosamente',
      data: savedImages.map(img => ({
        id: img.id,
        imagen_url: img.imagen_url,
        orden: img.orden
      }))
    });
  } catch (error) {
    console.error('Error subiendo imágenes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

module.exports = router;
