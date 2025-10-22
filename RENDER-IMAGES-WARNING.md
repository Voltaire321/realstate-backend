# ⚠️ ADVERTENCIA IMPORTANTE: SISTEMA DE ARCHIVOS EFÍMERO EN RENDER

## 🔴 PROBLEMA

Render usa un **sistema de archivos efímero**. Esto significa:

- ✅ Las imágenes se suben correctamente
- ❌ Se BORRAN cada vez que el servidor se reinicia
- ❌ Se BORRAN cada vez que haces un nuevo deploy
- ❌ Render reinicia el servidor automáticamente cada cierto tiempo

## ❌ ¿Por qué no veo las imágenes?

Las imágenes que están en tu base de datos fueron subidas antes, pero ya **NO EXISTEN** en el servidor de Render porque:

1. El servidor se reinició
2. Hiciste un nuevo deploy
3. Render limpió el sistema de archivos

## ✅ SOLUCIONES

### **Opción 1: Usar Cloudinary (RECOMENDADO)**

Cloudinary es un servicio GRATIS para almacenar imágenes en la nube.

#### Instalación:
```bash
npm install cloudinary multer-storage-cloudinary
```

#### Configuración:
```javascript
// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'realstate',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, height: 800, crop: 'limit' }]
  }
});

module.exports = { cloudinary, storage };
```

#### Actualizar routes/properties.js:
```javascript
const { storage } = require('../config/cloudinary');
const multer = require('multer');
const upload = multer({ storage: storage });

// Las imágenes se subirán a Cloudinary automáticamente
router.post('/:id/gallery', authenticateToken, upload.array('images', 10), async (req, res) => {
  // req.files[0].path contendrá la URL de Cloudinary
});
```

#### Variables de entorno en Render:
```
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret
```

Obtener credenciales: https://cloudinary.com/users/register/free

---

### **Opción 2: AWS S3 (Más complejo pero profesional)**

```bash
npm install @aws-sdk/client-s3 multer-s3
```

---

### **Opción 3: Render Disks (DE PAGO - $0.25/GB/mes)**

Render ofrece almacenamiento persistente pero cuesta dinero.

https://render.com/docs/disks

---

### **Opción 4: Subir imágenes al repositorio (NO RECOMENDADO)**

Puedes guardar las imágenes en el repositorio Git, pero:
- ❌ Repositorio se vuelve muy pesado
- ❌ Git no está diseñado para archivos binarios
- ❌ Límites de tamaño en GitHub

---

## 🚀 RECOMENDACIÓN FINAL

**Usa Cloudinary (Opción 1)** porque:

✅ Plan gratuito generoso (25 GB almacenamiento, 25 GB ancho de banda/mes)
✅ CDN incluido (imágenes se cargan super rápido)
✅ Transformaciones automáticas (redimensionar, optimizar)
✅ Fácil de implementar
✅ URLs permanentes
✅ No se borran nunca

---

## 📋 MIGRACIÓN RÁPIDA A CLOUDINARY

### 1. Crear cuenta en Cloudinary:
https://cloudinary.com/users/register/free

### 2. Obtener credenciales:
Dashboard → Settings → API Keys

### 3. Instalar paquetes:
```bash
npm install cloudinary multer-storage-cloudinary
```

### 4. Crear `config/cloudinary.js` (ver código arriba)

### 5. Actualizar `.env`:
```
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=tu-secret
```

### 6. Actualizar `routes/properties.js` para usar Cloudinary storage

### 7. Configurar variables en Render

### 8. Hacer deploy

---

## ⚠️ MIENTRAS TANTO (Solución temporal)

Para que funcionen las imágenes que ya tienes en la BD:

1. Las imágenes NO EXISTEN en Render
2. Necesitas RE-SUBIRLAS después de cada deploy
3. O migrar a Cloudinary

---

¿Necesitas ayuda implementando Cloudinary? Es la mejor solución.
