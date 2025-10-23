# Alternativas de Email para Producción

## ⭐ OPCIÓN 1: SendGrid (RECOMENDADA)

### Ventajas:
- 100 emails/día gratis
- No requiere dominio verificado inicialmente
- Muy confiable
- Fácil configuración

### Pasos:

1. **Crear cuenta:**
   - Ve a: https://sendgrid.com/
   - Regístrate gratis

2. **Generar API Key:**
   - Settings → API Keys → Create API Key
   - Permisos: "Full Access" o "Mail Send"
   - Copia el API Key

3. **Instalar paquete:**
```bash
npm install @sendgrid/mail
```

4. **Código de implementación:**

```javascript
// Reemplazar en routes/auth.js

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// En el endpoint /magic-link:
try {
  const msg = {
    to: email,
    from: 'cesaraepena@gmail.com', // Tu email verificado en SendGrid
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
  };

  await sgMail.send(msg);
  console.log(`✅ Código ${code} enviado EXITOSAMENTE`);
  
  res.json({ 
    message: 'Código enviado exitosamente a tu correo electrónico'
  });
} catch (emailError) {
  console.error('❌ Error enviando email:', emailError);
  await MagicCode.destroy({ where: { email } });
  return res.status(500).json({ 
    message: 'Error al enviar el código por correo.',
    error: 'EMAIL_SEND_FAILED'
  });
}
```

5. **Agregar variable en Render:**
   - Ve a tu servicio en Render
   - Environment → Add Environment Variable
   - Name: `SENDGRID_API_KEY`
   - Value: [tu API key de SendGrid]

---

## 🔄 OPCIÓN 2: Brevo (300 emails/día)

1. **Crear cuenta:** https://www.brevo.com/
2. **Generar API Key:** SMTP & API → API Keys
3. **Instalar:** `npm install @getbrevo/brevo`
4. **Código:**

```javascript
const SibApiV3Sdk = require('@getbrevo/brevo');
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
sendSmtpEmail.sender = { email: 'cesaraepena@gmail.com', name: 'Criss Vargas' };
sendSmtpEmail.to = [{ email: email }];
sendSmtpEmail.subject = 'Código de acceso';
sendSmtpEmail.htmlContent = `<html>...</html>`;

await apiInstance.sendTransacEmail(sendSmtpEmail);
```

---

## 📧 OPCIÓN 3: Mailgun

1. **Crear cuenta:** https://www.mailgun.com/
2. **Configurar dominio:** Domains → Add New Domain
3. **Instalar:** `npm install mailgun.js form-data`
4. **Código:**

```javascript
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY
});

await mg.messages.create(process.env.MAILGUN_DOMAIN, {
  from: 'Criss Vargas <noreply@tusitio.com>',
  to: [email],
  subject: 'Código de acceso',
  html: `<html>...</html>`
});
```

---

## 💰 OPCIÓN 4: Amazon SES (Producción escalable)

1. **Crear cuenta AWS**
2. **Activar SES:** Amazon Simple Email Service
3. **Verificar email o dominio**
4. **Instalar:** `npm install @aws-sdk/client-ses`
5. **Requiere configuración IAM**

---

## ⚖️ Comparación Rápida

| Servicio | Emails Gratis | Verificación | Dificultad | Recomendación |
|----------|---------------|--------------|------------|---------------|
| **SendGrid** | 100/día | Opcional | Fácil | ⭐⭐⭐⭐⭐ |
| **Brevo** | 300/día | Opcional | Fácil | ⭐⭐⭐⭐ |
| **Mailgun** | 100/día* | Requerida | Media | ⭐⭐⭐ |
| **Amazon SES** | $0.10/1000 | Requerida | Difícil | ⭐⭐⭐⭐ (producción) |
| **Resend** | 3000/mes | Requerida | Fácil | ⭐⭐⭐ |

*Mailgun: 1000 emails en primeros 3 meses

---

## ✅ Recomendación Final

Para tu caso (aplicación de bienes raíces con Magic Link):

1. **Ahora:** **SendGrid** - Rápido de configurar, sin problemas de dominio
2. **Futuro:** Cuando tengas más tráfico, considera **Amazon SES** (más barato a escala)
3. **Alternativa:** **Brevo** si necesitas más emails gratis (300/día)

---

## 🚀 Siguiente Paso

¿Quieres que implemente SendGrid ahora mismo? Solo dime "sí" y te configuro todo el código.
