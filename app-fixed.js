const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { testConnection, syncDatabase } = require('./config/database');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware CORS - ACTUALIZADO
const allowedOrigins = [
  'http://localhost:4200',
  'http://localhost:4000',
  'https://realestate.ltx.mx',
  'https://www.realestate.ltx.mx',
  'https://realstate-backend-sgc6.onrender.com', // ⚠️ AGREGAR TU BACKEND DE RENDER
  process.env.FRONTEND_URL
].filter(Boolean); // Elimina valores undefined

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('❌ CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
}));

// IMPORTANTE: Agregar headers CORS adicionales para preflight
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static('uploads'));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// ⚠️ ELIMINAR O COMENTAR ESTAS RUTAS DUPLICADAS
// app.use('/properties', propertyRoutes); // Esto causa rutas duplicadas

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    database: 'MySQL',
    port: PORT,
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins
  });
});

// ...existing code...

// Manejo de errores CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      success: false,
      message: 'CORS Error: Origin not allowed',
      origin: req.headers.origin 
    });
  }
  
  console.error('Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal!'
  });
});

// Ruta 404
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
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
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📡 Environment: ${process.env.NODE_ENV || 'production'}`);
      console.log(`🌍 CORS permitido para:`, allowedOrigins);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app;