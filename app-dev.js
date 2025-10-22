const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 4000;

// Middleware
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Servidor funcionando correctamente',
    database: 'MySQL (modo desarrollo)',
    port: PORT,
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
});

// Ruta de prueba CORS
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Rutas de autenticación simuladas (para desarrollo sin MySQL)
app.post('/api/auth/register', (req, res) => {
  res.json({ 
    message: 'Registro simulado (MySQL no conectado)',
    user: { id: 1, email: req.body.email, authMethod: 'password' }
  });
});

app.post('/api/auth/login', (req, res) => {
  const token = 'jwt_token_simulado_para_desarrollo';
  res.json({
    message: 'Login simulado (MySQL no conectado)',
    token,
    user: { id: 1, email: req.body.email, authMethod: 'password' }
  });
});

app.post('/api/auth/magic-link', (req, res) => {
  const code = Math.floor(10000 + Math.random() * 90000).toString();
  console.log(`📧 Código simulado: ${code} para ${req.body.email}`);
  res.json({ message: 'Código simulado enviado' });
});

app.post('/api/auth/verify-code', (req, res) => {
  const token = 'jwt_token_simulado_para_desarrollo';
  res.json({
    message: 'Código verificado (simulado)',
    token,
    user: { id: 1, email: req.body.email, authMethod: 'magic_link' }
  });
});

app.get('/api/auth/verify', (req, res) => {
  res.json({
    valid: true,
    user: { id: 1, email: 'test@example.com', authMethod: 'password' }
  });
});

app.get('/api/auth/dashboard', (req, res) => {
  res.json({
    message: 'Acceso al panel de control (simulado)',
    user: { id: 1, email: 'test@example.com', lastLogin: new Date() }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Error interno del servidor',
    error: err.message
  });
});

// Ruta 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor de desarrollo corriendo en puerto ${PORT}`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💡 Modo: Desarrollo (sin MySQL)`);
  console.log(`🎯 Frontend: http://localhost:4200`);
});

module.exports = app;
