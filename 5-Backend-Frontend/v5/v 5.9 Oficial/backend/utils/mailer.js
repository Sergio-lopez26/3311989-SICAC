import nodemailer from "nodemailer";

// Toca instalar nodemailer -> npm install nodemailer

// Se crea el "transportador" del correo, usando las credenciales que están en el .env
// Por defecto se deja configurado para Gmail, pero se puede cambiar el servicio/host según el proveedor que se use
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Correo que envía (ej: cuenta de Gmail del sistema)
        pass: process.env.EMAIL_PASS, // Contraseña de aplicación (NO la contraseña normal de la cuenta)
    },
});

/**
 * Envía el correo con el código de recuperación de contraseña
 * @param {string} destinatario - Correo del usuario que solicitó la recuperación
 * @param {string} codigo - Código de 6 dígitos generado para validar la recuperación
 */
export const enviarCodigoRecuperacion = async (destinatario, codigo) => {
    const mailOptions = {
        from: `"SICAC - Soporte" <${process.env.EMAIL_USER}>`,
        to: destinatario,
        subject: "Código de recuperación de contraseña - SICAC",
        html: `
            <div style="font-family: Arial, Helvetica, sans-serif; max-width: 480px; margin: 0 auto; border: 1px solid #d0e2ff; border-radius: 12px; padding: 24px;">
                <h2 style="color: #103e6e; text-align: center;">Recuperación de Contraseña</h2>
                <p>Hola,</p>
                <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en <b>SICAC</b>. Utiliza el siguiente código para continuar con el proceso:</p>
                <div style="text-align: center; margin: 24px 0;">
                    <span style="display: inline-block; background-color: #d9ecff; color: #103e6e; font-size: 28px; font-weight: bold; letter-spacing: 6px; padding: 12px 24px; border-radius: 12px;">
                        ${codigo}
                    </span>
                </div>
                <p>Este código es válido durante <b>15 minutos</b>. Si tú no solicitaste este cambio, puedes ignorar este correo; tu contraseña seguirá siendo la misma.</p>
                <p style="margin-top: 24px; color: #666; font-size: 12px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
            </div>
        `,
    };

    // Se envía el correo mediante el transportador configurado
    await transporter.sendMail(mailOptions);
};

export default transporter;
