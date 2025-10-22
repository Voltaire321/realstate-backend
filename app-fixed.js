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
  'http://realestate.ltx.mx',
  'https://realestate.ltx.mx',
  'https://www.realestate.ltx.mx',
  'https://realstate-backend-sgc6.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir requests sin origin (mobile apps, postman, etc.)
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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ CORREGIDO: Servir archivos estáticos con headers CORS correctos
app.use('/uploads', (req, res, next) => {
  // Configurar headers CORS específicos para imágenes
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Cache-Control', 'public, max-age=31557600'); // Cache por 1 año
  next();
}, express.static('uploads', {
  maxAge: '1y', // Cache
  etag: true,
  lastModified: true
}));

// Rutas principales
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// ⚠️ ELIMINAR ESTA LÍNEA - Causa conflictos
// app.use('/properties', propertyRoutes);

// Ruta de prueba - MEJORADA
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true,
    message: 'Servidor funcionando correctamente',
    database: 'MySQL',
    port: PORT,
    timestamp: new Date().toISOString(),
    allowedOrigins: allowedOrigins,
    routes: {
      auth: '/api/auth',
      properties: '/api/properties',
      uploads: '/uploads'
    }
  });
});

// Ruta para verificar conexión a BD
app.get('/api/db-status', async (req, res) => {
  try {
    const isConnected = await testConnection();
    res.json({
      success: true,
      database: isConnected ? 'Conectada' : 'Desconectada',
      host: process.env.DB_HOST,
      name: process.env.DB_NAME
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verificando base de datos',
      error: error.message
    });
  }
});

// Manejo de errores CORS
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      success: false,
      message: 'CORS Error: Origin not allowed',
      origin: req.headers.origin 
    });
  }
  
  console.error('❌ Error:', err.stack);
  res.status(500).json({ 
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal!'
  });
});

// Ruta 404
app.use((req, res) => {
  console.log('❌ Ruta no encontrada:', req.method, req.originalUrl);
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: {
      auth: [
        'POST /api/auth/login',
        'POST /api/auth/register',
        'POST /api/auth/magic-link'
      ],
      properties: [
        'GET /api/properties',
        'GET /api/properties/public',
        'POST /api/properties'
      ],
      health: [
        'GET /api/health',
        'GET /api/db-status'
      ]
    }
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
      console.log(`🔗 Health check: /api/health`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

module.exports = app;