// Configuración de desarrollo para Criss Vargas Backend
const config = {
  port: process.env.PORT || 4000,
  database: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'crissvargas',
    port: process.env.DB_PORT || 3306
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'clave_segura_generada_para_jwt_tokens_2024_criss_vargas'
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:4200'
  },
  email: {
    user: process.env.EMAIL_USER || 'cesaraepena@gmail.com',
    pass: process.env.EMAIL_PASS || 'cesargoop'
  }
};

module.exports = config;
