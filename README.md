# Criss Vargas Backend - Sistema de Autenticación con MySQL

Este es el backend del sistema de bienes raíces de Criss Vargas, que incluye un módulo completo de autenticación con Magic Link usando MySQL como base de datos.

## Características

- ✅ Autenticación con email y contraseña
- ✅ Magic Link con código de 5 dígitos
- ✅ JWT para sesiones seguras (expira en 1 hora)
- ✅ Envío de emails con Nodemailer
- ✅ Encriptación de contraseñas con bcrypt
- ✅ Base de datos MySQL con Sequelize ORM
- ✅ CORS configurado para el frontend Angular

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `env.example`:

```bash
# Puerto del servidor
PORT=4000

# URL del frontend (Angular)
FRONTEND_URL=http://localhost:4200

# Base de datos MySQL
DB_HOST=tu-host-remoto
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña
DB_NAME=tu-base-de-datos
DB_PORT=3306

# JWT Secret (cambiar por una clave segura en producción)
JWT_SECRET=clave_segura_generada_para_jwt_tokens_2024

# Configuración de email (Gmail)
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_contraseña_de_aplicacion

# Configuración de CORS
CORS_ORIGIN=http://localhost:4200
```

### 2. Configuración de MySQL

Asegúrate de tener MySQL instalado y ejecutándose:

```bash
# Crear base de datos
mysql -u root -p
CREATE DATABASE tu_base_de_datos;
```

### 3. Configuración de Gmail

Para enviar emails, necesitas configurar una "Contraseña de aplicación" en Gmail:

1. Ve a tu cuenta de Google
2. Seguridad → Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicaciones
4. Genera una nueva contraseña para "Correo"
5. Usa esa contraseña en `EMAIL_PASS`

### 4. Instalación y Ejecución

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar en modo producción
npm start
```

## Estructura del Proyecto

```
CrissVargasBack/
├── config/
│   └── database.js          # Configuración de MySQL con Sequelize
├── models/
│   ├── User.js              # Modelo de Usuario
│   └── MagicCode.js         # Modelo de Códigos Magic Link
├── routes/
│   └── auth.js              # Rutas de autenticación
├── app.js                   # Servidor principal
├── package.json             # Dependencias y scripts
├── .env.example            # Variables de entorno de ejemplo
└── README.md               # Documentación
```

## Endpoints de la API

### Autenticación

- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Login con email/contraseña
- `POST /api/auth/magic-link` - Solicitar Magic Link
- `POST /api/auth/verify-code` - Verificar código Magic Link
- `GET /api/auth/verify` - Verificar token JWT

### Panel de Control

- `GET /api/auth/dashboard` - Acceso al panel (requiere autenticación)

### Utilidades

- `GET /api/health` - Estado del servidor

## Estructura de Respuestas

### Login Exitoso
```json
{
  "message": "Login exitoso",
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "authMethod": "password"
  }
}
```

### Magic Link Exitoso
```json
{
  "message": "Código verificado exitosamente",
  "token": "jwt_token_aqui",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "authMethod": "magic_link"
  }
}
```

## Base de Datos

El sistema utiliza MySQL con las siguientes tablas:

- `users` - Usuarios del sistema
- `magic_codes` - Códigos de Magic Link (se eliminan automáticamente)

### Modelos Sequelize

**User:**
- `id` (INTEGER, PK, AUTO_INCREMENT)
- `email` (STRING, UNIQUE, NOT NULL)
- `password` (STRING, nullable para Magic Link)
- `authMethod` (ENUM: 'password', 'magic_link')
- `isActive` (BOOLEAN, default: true)
- `lastLogin` (DATE, nullable)
- `createdAt`, `updatedAt` (TIMESTAMP)

**MagicCode:**
- `id` (INTEGER, PK, AUTO_INCREMENT)
- `email` (STRING, NOT NULL)
- `code` (STRING(5), NOT NULL)
- `expiresAt` (DATE, NOT NULL)
- `used` (BOOLEAN, default: false)
- `createdAt`, `updatedAt` (TIMESTAMP)

## Seguridad

- Contraseñas encriptadas con bcrypt (salt rounds: 10)
- JWT con expiración de 1 hora
- Códigos Magic Link expiran en 10 minutos
- CORS configurado para el dominio del frontend
- Validación de entrada en todos los endpoints
- Hooks de Sequelize para encriptación automática

## Desarrollo

Para desarrollo, usa:
```bash
npm run dev
```

Esto ejecutará el servidor con nodemon para recarga automática.
