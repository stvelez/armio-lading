import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send welcome email after signup
 */
export async function sendWelcomeEmail(email: string) {
  try {
    const data = await resend.emails.send({
      from: process.env.NEXT_PUBLIC_RESEND_FROM || 'hola@armio.co',
      to: email,
      subject: '¡Bienvenido a Armio! 🚀',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Armio</title>
          <style>
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              background-color: #2C2C2A;
              color: white;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #1D1D1B;
              border-radius: 12px;
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%);
              padding: 40px 20px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 32px;
              font-weight: 600;
              letter-spacing: -0.02em;
            }
            .content {
              padding: 40px 20px;
            }
            .content h2 {
              color: #1D9E75;
              margin-top: 0;
              font-size: 24px;
              font-weight: 600;
            }
            .content p {
              line-height: 1.6;
              color: #B4B2A9;
              margin-bottom: 20px;
            }
            .cta-button {
              display: inline-block;
              background: #1D9E75;
              color: white;
              padding: 16px 32px;
              border-radius: 8px;
              text-decoration: none;
              font-weight: 500;
              margin-top: 20px;
              transition: background-color 0.2s;
            }
            .cta-button:hover {
              background: #0F6E56;
            }
            .benefits {
              background: #2C2C2A;
              border-radius: 8px;
              padding: 24px;
              margin: 24px 0;
            }
            .benefit {
              display: flex;
              align-items: center;
              margin-bottom: 16px;
            }
            .benefit:last-child {
              margin-bottom: 0;
            }
            .check {
              color: #1D9E75;
              margin-right: 12px;
              font-size: 20px;
            }
            .footer {
              text-align: center;
              padding: 24px;
              color: #888780;
              font-size: 14px;
            }
            .footer a {
              color: #1D9E75;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>¡Bienvenido a Armio!</h1>
            </div>

            <div class="content">
              <h2>Estás en la lista 🎉</h2>

              <p>Gracias por unirte a los primeros early adopters de Armio. Eres uno de los primeros 100 en recibir acceso exclusivo.</p>

              <div class="benefits">
                <div class="benefit">
                  <span class="check">✓</span>
                  <span>50% OFF de por vida en el plan Professional</span>
                </div>
                <div class="benefit">
                  <span class="check">✓</span>
                  <span>Early access cuando lancemos oficialmente</span>
                </div>
                <div class="benefit">
                  <span class="check">✓</span>
                  <span>Soporte prioritario para early adopters</span>
                </div>
              </div>

              <p><strong>¿Qué sigue?</strong></p>
              <p>Te avisaremos cuando estemos listos para el lanzamiento. Mientras tanto, podemos decirte que Armio transformará cómo manejas tu agencia inmobiliaria:</p>

              <div class="benefit">
                <span class="check">✓</span>
                <span>Centraliza todas tus propiedades</span>
              </div>
              <div class="benefit">
                <span class="check">✓</span>
                <span>Organiza leads y cierra más ventas</span>
              </div>
              <div class="benefit">
                <span class="check">✓</span>
                <span>Automatiza contratos digitales</span>
              </div>

              <p>Estamos muy cerca del lanzamiento. ¡Estén atentos!</p>

              <a href="https://armio.co" class="cta-button">Visita armio.co</a>
            </div>

            <div class="footer">
              <p>© 2026 Armio · <a href="https://armio.co">armio.co</a></p>
              <p style="font-size: 12px; margin-top: 12px;">Si no te suscribiste, puedes ignorar este email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    return data;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
}

/**
 * Send drip campaign email - Day 1
 */
export async function sendDripDay1(email: string) {
  try {
    await resend.emails.send({
      from: process.env.NEXT_PUBLIC_RESEND_FROM || 'hola@armio.co',
      to: email,
      subject: '¿Cómo transformará Armio tu agencia?',
      html: `
        <p>Hola,</p>
        <p>¿Te imaginas tener todo tu negocio inmobiliario en un solo lugar?</p>
        <p>Con Armio podrás:</p>
        <ul>
          <li>Gestionar tu cartera completa de propiedades</li>
          <li>Organizar leads y asignarlos a agentes</li>
          <li>Automatizar contratos digitales</li>
          <li>Visualizar métricas en tiempo real</li>
        </ul>
        <p>Todo esto en una interfaz intuitiva que cualquiera puede usar.</p>
        <p>Próximamente te contaremos más...</p>
        <p>Saludos,<br>El equipo de Armio</p>
      `,
    });
  } catch (error) {
    console.error('Error sending drip day 1 email:', error);
    throw error;
  }
}

/**
 * Send drip campaign email - Day 3
 */
export async function sendDripDay3(email: string) {
  try {
    await resend.emails.send({
      from: process.env.NEXT_PUBLIC_RESEND_FROM || 'hola@armio.co',
      to: email,
      subject: 'El caos de Excel vs Armio',
      html: `
        <p>Hola,</p>
        <p>Hablando con agencias inmobiliarias en Colombia, siempre escuchamos lo mismo:</p>
        <p>"Usamos Excel, WhatsApp y WhatsApp..."</p>
        <p><strong>El problema:</strong></p>
        <ul>
          <li>Propiedades dispersas en múltiples archivos</li>
          <li>Leads perdidos en conversaciones personales</li>
          <li>Sin visibilidad del pipeline de ventas</li>
          <li>10+ tabs abiertos todo el tiempo</li>
        </ul>
        <p><strong>La solución con Armio:</strong></p>
        <ul>
          <li>Todo centralizado en un solo lugar</li>
          <li>Leads organizados y asignados</li>
          <li>Dashboard con métricas en tiempo real</li>
          <li>Pipeline visual de cada propiedad</li>
        </ul>
        <p>Próximamente te mostraremos cómo se ve...</p>
        <p>Saludos,<br>El equipo de Armio</p>
      `,
    });
  } catch (error) {
    console.error('Error sending drip day 3 email:', error);
    throw error;
  }
}

/**
 * Send drip campaign email - Day 7
 */
export async function sendDripDay7(email: string) {
  try {
    await resend.emails.send({
      from: process.env.NEXT_PUBLIC_RESEND_FROM || 'hola@armio.co',
      to: email,
      subject: 'Invita a un colega y obtén beneficios extra',
      html: `
        <p>Hola,</p>
        <p>¿Conoces a alguien que también lidiará con el caos de Excel y WhatsApp en su agencia?</p>
        <p>Invítalo a unirse a la lista de espera de Armio y obtén:</p>
        <ul>
          <li>Acceso prioritario al lanzamiento</li>
          <li>Bonos especiales para referidos</li>
          <li>Feature exclusiva para agencias que inviten</li>
        </ul>
        <p>Simplemente comparte: <a href="https://armio.co">https://armio.co</a></p>
        <p>Entre más colegas invites, más beneficios recibirás.</p>
        <p>Saludos,<br>El equipo de Armio</p>
      `,
    });
  } catch (error) {
    console.error('Error sending drip day 7 email:', error);
    throw error;
  }
}

/**
 * Send launch announcement email
 */
export async function sendLaunchEmail(email: string, discountCode: string) {
  try {
    await resend.emails.send({
      from: process.env.NEXT_PUBLIC_RESEND_FROM || 'hola@armio.co',
      to: email,
      subject: '¡Armio ya está disponible! 🎉',
      html: `
        <p>¡Hola!</p>
        <p>¡Ya es el día! Armio está oficialmente disponible.</p>
        <p>Como early adopter, tienes un código especial:</p>
        <p style="font-size: 24px; color: #1D9E75; font-weight: bold;">${discountCode}</p>
        <p>Este código te da <strong>50% OFF de por vida</strong> en el plan Professional.</p>
        <p><a href="https://armio.co" style="background: #1D9E75; color: white; padding: 16px 32px; border-radius: 8px; text-decoration: none; font-weight: 500;">¡Empieza ahora!</a></p>
        <p>Saludos,<br>El equipo de Armio</p>
      `,
    });
  } catch (error) {
    console.error('Error sending launch email:', error);
    throw error;
  }
}
