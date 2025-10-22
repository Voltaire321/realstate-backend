const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static('uploads'));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// Rutas adicionales para compatibilidad con frontend
app.use('/properties', propertyRoutes);

// Ruta temporal sin autenticación para pruebas
app.post('/properties-test', async (req, res) => {
  try {
    const propertyData = req.body;
    
    // Validar campos requeridos
    if (!propertyData.titulo || !propertyData.tipo || !propertyData.precio) {
      return res.status(400).json({
        success: false,
        message: 'Título, tipo y precio son campos requeridos'
      });
    }

    // Simular creación de propiedad (sin base de datos por ahora)
    const mockProperty = {
      id: Math.floor(Math.random() * 1000),
      titulo: propertyData.titulo,
      descripcion: propertyData.descripcion || null,
      tipo: propertyData.tipo,
      precio: propertyData.precio,
      tag: propertyData.tag || null,
      estado: 'activa',
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Propiedad creada exitosamente (modo prueba)',
      data: mockProperty
    });
  } catch (error) {
    console.error('Error creando propiedad (prueba):', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor' 
    });
  }
});

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    database: 'MySQL',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal!'
  });
});

// Ruta 404 - usando una ruta específica en lugar de wildcard
app.use((req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Función para inicializar el servidor
const startServer = async () => {
  try {
    // Probar conexión a la base de datos
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ No se pudo conectar a la base de datos. Saliendo...');
      process.exit(1);
    }

    // Sincronizar modelos con la base de datos
    await syncDatabase();

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app;
