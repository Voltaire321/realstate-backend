const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const config = require('./config');
const { testConnection, syncDatabase } = require('./config/database-simple');
const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/properties');
require('./config/associations'); // Configurar asociaciones entre modelos

const app = express();
const PORT = config.port;

// Configuración de CORS para múltiples orígenes
const allowedOrigins = [
  'http://localhost:4200',
  'https://realestate.ltx.mx',
  'http://realestate.ltx.mx',
  process.env.FRONTEND_URL
].filter(Boolean);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Permitir requests sin origin (Postman, curl, apps móviles)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ CORS bloqueado para origen: ${origin}`);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);

// Rutas adicionales para compatibilidad con frontend
app.use('/properties', propertyRoutes);

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    database: 'MySQL',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Ruta de prueba CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', config.frontend.url);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal!'
  });
});

// Ruta 404
app.use('*', (req, res) => {
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
