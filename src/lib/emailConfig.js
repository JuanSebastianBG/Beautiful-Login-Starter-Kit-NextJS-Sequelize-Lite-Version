import nodemailer from "nodemailer";

export const sendEmail = async (subject, to, html, attachments = []) => {
  try {
    // Verificar variables de entorno primero
    const emailConfig = {
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_SECURE,
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    };

    // Verificar que todas las variables estén presentes
    if (
      !emailConfig.host ||
      !emailConfig.port ||
      !emailConfig.user ||
      !emailConfig.pass
    ) {
      throw new Error(
        "Variables de entorno de email no configuradas correctamente"
      );
    }

    const transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: parseInt(emailConfig.port),
      secure: emailConfig.secure === "true",
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
      debug: true,
      logger: true,
    });

    await transporter.verify();

    const mailOptions = {
      from: `Axity <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      attachments,
    };

    const result = await transporter.sendMail(mailOptions);

    console.log("✅ Email enviado exitosamente:", {
      messageId: result.messageId,
      response: result.response,
    });
    return true;
  } catch (error) {
    console.log("=== ERROR EN EMAIL ===");
    console.error("Error detallado al enviar email:", {
      name: error.name,
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response,
      responseCode: error.responseCode,
      stack: error.stack,
    });

    // Errores específicos de Gmail
    if (error.code === "EAUTH") {
      console.error(
        "❌ Error de autenticación: Verifica EMAIL_USER y EMAIL_PASS"
      );
      console.error(
        "💡 Asegúrate de usar una contraseña de aplicación de Gmail"
      );
    } else if (error.code === "ECONNECTION") {
      console.error("❌ Error de conexión: Verifica EMAIL_HOST y EMAIL_PORT");
    } else if (error.responseCode === 535) {
      console.error(
        "❌ Credenciales inválidas: Verifica la contraseña de aplicación"
      );
    }

    console.log("=== FIN ERROR EMAIL ===");
    return false;
  }
};

// Nuevo template para códigos de verificación
export const verificationCodeTemplate = (code, actionType, userName) => {
  const actionText = {
    register: "completar tu registro",
    login: "iniciar sesión",
    password_reset: "restablecer tu contraseña",
  };

  return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Código de Verificación - Axity</title>
        </head>
        <body style="margin: 0; padding: 40px 20px; background-color: #f5f3ff; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #312e81;">
            <div style="max-width: 600px; margin: 0 auto; padding: 60px 0;">
                <div style="padding: 0px 0px 40px;">
                    <h1 style="color: #7c3aed; text-align: center; font-weight: 800; font-size: 40px; margin: 0px;">Axity</h1>
                </div>
                <div style="background-color: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.1);">
                    <div style="padding: 30px 20px; text-align: center; background-color: #7c3aed; color: #f5f3ff;">
                        <h2 style="margin: 0; font-size: 20px;">Código de Verificación</h2>
                    </div>
                    <div style="padding: 50px; background-color: #ede9fe; color: #312e81; border-radius: 0 0 20px 20px;">
                        <p style="margin-top: 0;">Hola</p>
                        <p>Has solicitado iniciar sesión en <strong>Axity</strong>.</p>
                        <p>Tu código de verificación es:</p>
                        <div style="text-align: center; margin: 40px 0;">
                            <div style="display: inline-block; padding: 25px 50px; background-color: #7c3aed; color: #f5f3ff; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 15px; font-family: monospace;">
                                ${code}
                            </div>
                        </div>
                        <p><strong>Este código expira en 15 minutos.</strong></p>
                        <p style="margin-bottom: 0;"><em>Si no solicitaste esta acción, puedes ignorar este correo.</em></p>
                    </div>
                </div>
                <p style="text-align: center; margin: 40px 0; font-weight: 600; color: #312e81;">&copy; Axity, 2024.</p>
            </div>
        </body>
        </html>
    `;
};

export const recoveryTemplate = (link) => {
  return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Axity</title>
        </head>
        <body style="margin: 0; padding: 20px 10px; background-color: #f5f3ff; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #312e81;">
            <div style="max-width: 600px; margin: 0 auto; padding: 50px 0;">
                <div style="padding: 0px 0px 30px;">
                    <h1 style="color: #7c3aed; text-align: center; font-weight: 800; font-size: 40px; margin: 0px;">Axity</h1>
                </div>
                <div style="padding: 25px 10px; text-align: center; background-color: #7c3aed; color: #f5f3ff;">
                    <h2>Recupera tu contraseña</h2>
                </div>
                <div style="padding: 40px; background-color: #ede9fe !important; color: #312e81;">
                    <p style="margin-top: 0;">Hola,</p>
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>Axity</strong>.</p>
                    <p>Para continuar, haz clic en el siguiente botón:</p>
                    <p>
                        <a href="${link}" style="display: inline-block; padding: 15px 40px; background-color: #7c3aed; color: #f5f3ff; text-decoration: none; border-radius: 6px; font-weight: bold;">Restablecer contraseña</a>
                    </p>
                    <p style="margin-bottom: 0;"><em>Si no solicitaste este cambio, puedes ignorar este correo.</em></p>
                </div>
                <p style="text-align: center; margin: 30px 0; font-weight: 600; color: #312e81;">&copy; Axity, 2024.</p>
            </div>
        </body>
        </html>
    `;
};

export const UpdatedPasswordTemplate = (user_name) => {
  return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Axity</title>
        </head>
        <body style="margin: 0; padding: 20px 10px; background-color: #f5f3ff; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #312e81;">
            <div style="max-width: 600px; margin: 0 auto; padding: 50px 0;">
                <div style="padding: 0px 0px 30px;">
                    <h1 style="color: #7c3aed; text-align: center; font-weight: 800; font-size: 40px; margin: 0px;">Axity</h1>
                </div>
                <div style="padding: 25px 10px; text-align: center; background-color: #7c3aed; color: #f5f3ff;">
                    <h2>Contraseña actualizada</h2>
                </div>
                <div style="padding: 40px; background-color: #ede9fe !important; color: #312e81;">
                    <p style="margin-top: 0;">Hola ${user_name},</p>
                    <p>Te informamos que <strong style="color: #7c3aed;">tu contraseña en Axity ha sido cambiada exitosamente</strong>.</p>
                    <p>Si realizaste este cambio, no necesitas hacer nada más.</p>
                    <p>Si no reconoces esta acción, por favor contacta a nuestro equipo de soporte inmediatamente para proteger tu cuenta.</p>
                    <p style="margin-bottom: 0;"><em>La seguridad de tu cuenta es muy importante para nosotros.</em></p>
                </div>
                <p style="text-align: center; margin: 30px 0; font-weight: 600; color: #312e81;">&copy; Axity, 2024.</p>
            </div>
        </body>
        </html>
    `;
};

export const roleRequestTemplate = (userName, userEmail, requestedRole) => {
  return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Solicitud de Cambio de Rol - Axity</title>
        </head>
        <body style="margin: 0; padding: 20px 10px; background-color: #f5f3ff; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #312e81;">
            <div style="max-width: 600px; margin: 0 auto; padding: 50px 0;">
                <div style="padding: 0px 0px 30px;">
                    <h1 style="color: #7c3aed; text-align: center; font-weight: 800; font-size: 40px; margin: 0px;">Axity</h1>
                </div>
                <div style="padding: 25px 10px; text-align: center; background-color: #7c3aed; color: #f5f3ff;">
                    <h2>Solicitud de Cambio de Rol</h2>
                </div>
                <div style="padding: 40px; background-color: #ede9fe !important; color: #312e81;">
                    <p style="margin-top: 0;">Se ha recibido una nueva solicitud de cambio de rol:</p>
                    <ul style="list-style:none; padding:0;">
                        <li><strong>Nombre:</strong> ${userName}</li>
                        <li><strong>Email:</strong> ${userEmail}</li>
                        <li><strong>Rol solicitado:</strong> ${requestedRole}</li>
                    </ul>
                    <p style="margin-bottom: 0;">Por favor revisa y gestiona esta solicitud en el panel de administración.</p>
                </div>
                <p style="text-align: center; margin: 30px 0; font-weight: 600; color: #312e81;">&copy; Axity, 2024.</p>
            </div>
        </body>
        </html>
    `;
};

export const sendRoleRequestEmail = async (
  userName,
  userEmail,
  requestedRole
) => {
  const html = roleRequestTemplate(userName, userEmail, requestedRole);
  return await sendEmail(
    "Nueva solicitud de cambio de rol",
    "juansebastianbernalgamboa@gmail.com",
    html
  );
};

// Nueva función para enviar códigos de verificación
export const sendVerificationCode = async (
  email,
  code,
  actionType,
  userName
) => {
  const html = verificationCodeTemplate(code, actionType, userName);
  const subjects = {
    register: "Código de verificación para registro - Axity",
    login: "Código de verificación para inicio de sesión - Axity",
    password_reset:
      "Código de verificación para restablecer contraseña - Axity",
  };

  return await sendEmail(subjects[actionType], email, html);
};

// Nuevo template para link de verificación
export const verificationLinkTemplate = (
  verificationLink,
  actionType,
  userName
) => {
  const actionText = {
    register: "completar tu registro",
    login: "iniciar sesión",
    password_reset: "restablecer tu contraseña",
  };

  return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title>Verificación - Axity</title>
        </head>
        <body style="margin: 0; padding: 20px 10px; background-color: #f5f3ff; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; color: #312e81;">
            <div style="max-width: 600px; margin: 0 auto; padding: 50px 0;">
                <div style="padding: 0px 0px 30px;">
                    <h1 style="color: #7c3aed; text-align: center; font-weight: 800; font-size: 40px; margin: 0px;">Axity</h1>
                </div>
                <div style="padding: 25px 10px; text-align: center; background-color: #7c3aed; color: #f5f3ff;">
                    <h2>Verificación de Cuenta</h2>
                </div>
                <div style="padding: 40px; background-color: #ede9fe !important; color: #312e81;">
                    <p style="margin-top: 0;">Hola ${userName || ""},</p>
                    <p>Has solicitado ${
                    actionText[actionType]
                    } en <strong>Axity</strong>.</p>
                    <p>Haz clic en el siguiente botón para verificar tu cuenta:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="display: inline-block; padding: 15px 30px; background-color: #7c3aed; color: #f5f3ff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">Verificar Cuenta</a>
                    </div>
                    <p><strong>Este enlace expira en 15 minutos.</strong></p>
                    <p style="margin-bottom: 0;"><em>Si no solicitaste esta acción, puedes ignorar este correo.</em></p>
                </div>
                <p style="text-align: center; margin: 30px 0; font-weight: 600; color: #312e81;">&copy; Axity, 2024.</p>
            </div>
        </body>
        </html>
    `;
};

// Nueva función para enviar link de verificación
export const sendVerificationLink = async (
  email,
  code,
  actionType,
  userName
) => {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const verificationLink = `${baseUrl}/auth/verify?email=${encodeURIComponent(
    email
  )}&action=${actionType}&code=${code}`;

  const html = verificationLinkTemplate(verificationLink, actionType, userName);
  const subjects = {
    register: "Verificación de registro - Axity",
    login: "Verificación de inicio de sesión - Axity",
    password_reset: "Verificación para restablecer contraseña - Axity",
  };

  return await sendEmail(subjects[actionType], email, html);
};