import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);
const resendFrom = process.env.RESEND_FROM || "hola@armio.co";

/**
 * Send welcome email after signup
 */
export async function sendWelcomeEmail(email: string) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("Missing RESEND_API_KEY");
  }

  const data = await resend.emails.send({
    from: resendFrom,
    to: email,
    subject: "¡Bienvenido a Armio! 🚀",
    html: `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bienvenido a Armio</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f4; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%); padding: 40px 32px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; color: white; }
          .content { padding: 32px; color: #333; }
          .content p { line-height: 1.6; margin: 0 0 16px; }
          ul { margin: 16px 0; padding-left: 20px; }
          li { margin-bottom: 8px; line-height: 1.5; }
          .footer { text-align: center; padding: 24px; color: #888; font-size: 13px; border-top: 1px solid #eee; }
          .footer a { color: #1D9E75; text-decoration: none; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por suscribirte a Armio!</h1>
          </div>
          <div class="content">
            <p>Gracias por suscribirte a las novedades de Armio.</p>
            <p>Armio ya está disponible para ordenar tu operación inmobiliaria.</p>
            <ul>
              <li>Centraliza propiedades, leads y contratos</li>
              <li>Pipeline visual de ventas</li>
              <li>Contratos digitales automatizados</li>
            </ul>
            <p>Pruébalo 3 meses gratis, sin tarjeta: <a href="https://app.armio.co/register">crea tu cuenta</a>.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Armio · <a href="https://armio.co">armio.co</a></p>
            <p>Si no te suscribiste, puedes ignorar este email.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });

  return data;
}
