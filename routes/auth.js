const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Resend } = require('resend');
const { Op } = require('sequelize');

const User = require('../models/User');
const MagicCode = require('../models/MagicCode');

const router = express.Router();

// Configuración de Resend (reemplaza Nodemailer)
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de acceso requerido' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

// POST /register - Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password, nombre } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El usuario ya existe' });
    }

    // Crear usuario
    const user = await User.create({
      nombre: nombre || null,
      email,
      password,
      authMethod: 'password'
    });

    res.status(201).json({ 
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /login - Login con email y contraseña
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Actualizar último login
    await user.updateLastLogin();

    // Generar JWT (expira en 1 hora)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// POST /magic-link - Solicitar Magic Link
router.post('/magic-link', async (req, res) => {
  try {
    const { email } = req.body;
    
    console.log('🔐 === MAGIC LINK REQUEST ===');
    console.log('📧 Email solicitado:', email);
    console.log('📬 EMAIL_USER configurado:', process.env.EMAIL_USER ? 'SÍ ✅' : 'NO ❌');
    console.log('🔑 EMAIL_PASS configurado:', process.env.EMAIL_PASS ? 'SÍ ✅' : 'NO ❌');

    if (!email) {
      return res.status(400).json({ message: 'Email es requerido' });
    }

    // Verificar si el usuario existe
    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      console.log('❌ Usuario NO encontrado en BD');
      return res.status(404).json({ 
        message: 'Correo no registrado.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    console.log('✅ Usuario encontrado en BD');

    // Generar código de 5 dígitos
    const code = Math.floor(10000 + Math.random() * 90000).toString();

    // Eliminar códigos anteriores para este email
    await MagicCode.destroy({ where: { email } });

    // Crear nuevo código
    const magicCode = await MagicCode.create({
      email,
      code
    });
    
    console.log(`🎲 Código generado: ${code}`);
    console.log('💾 Código guardado en BD');
    
    console.log('📮 Intentando enviar email con Resend...');
    console.log('📧 Hacia:', email);
    console.log('🔑 API Key configurada:', process.env.RESEND_API_KEY ? 'SÍ ✅' : 'NO ❌');

    try {
      const { data, error } = await resend.emails.send({
        from: 'Criss Vargas <onboarding@resend.dev>',
        to: [email],
        subject: 'Código de acceso - Criss Vargas',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Código de Acceso</h2>
            <p>Hola,</p>
            <p>Tu código de acceso es:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0;">
              <h1 style="color: #007bff; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
            </div>
            <p>Este código expira en 10 minutos.</p>
            <p>Si no solicitaste este código, puedes ignorar este email.</p>
            <br>
            <p>Saludos,<br>Equipo Criss Vargas</p>
          </div>
        `
      });

      if (error) {
        throw error;
      }

      console.log(`✅ Código ${code} enviado EXITOSAMENTE por email a ${email}`);
      console.log(`📧 ID del mensaje:`, data.id);
      console.log('🔐 === MAGIC LINK SUCCESS ===');
      
      res.json({ 
        message: 'Código enviado exitosamente a tu correo electrónico'
      });
    } catch (emailError) {
      console.error('❌ === EMAIL ERROR ===');
      console.error('Error completo:', emailError);
      console.error('Mensaje:', emailError.message);
      
      // Eliminar el código generado si el email falló
      await MagicCode.destroy({ where: { email } });
      
      // Devolver error al frontend
      return res.status(500).json({ 
        message: 'Error al enviar el código por correo. Por favor intenta más tarde.',
        error: 'EMAIL_SEND_FAILED',
        details: emailError.message
      });
    }
  } catch (error) {
    console.error('Error enviando magic link:', error);
    res.status(500).json({ message: 'Error enviando código' });
  }
});

// POST /verify-code - Verificar código Magic Link
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email y código son requeridos' });
    }

    // Buscar código válido
    const magicCode = await MagicCode.findOne({
      where: {
        email,
        code,
        used: false,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!magicCode) {
      return res.status(401).json({ message: 'Código inválido o expirado' });
    }

    // Marcar código como usado
    await magicCode.markAsUsed();

    // Buscar usuario (debe existir ya que se validó en /magic-link)
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado. Por favor, regístrese primero.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Actualizar último login
    await user.updateLastLogin();

    // Generar JWT (expira en 1 hora)
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Código verificado exitosamente',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Error verificando código:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /verify - Verificar token
router.get('/verify', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      valid: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        authMethod: user.authMethod
      }
    });
  } catch (error) {
    console.error('Error verificando token:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

// GET /dashboard - Panel de control (requiere autenticación)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    res.json({
      message: 'Acceso al panel de control',
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error accediendo al dashboard:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
});

module.exports = router;
