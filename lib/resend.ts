import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvitationEmail(email: string, token: string, name?: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const link = `${appUrl}/register?token=${token}`

  await resend.emails.send({
    from: 'CRONIA <hola@cronia.mx>',
    to: email,
    subject: 'Tu acceso a CRONIA está listo',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="background:#000;color:#F5F5F5;font-family:sans-serif;padding:40px;max-width:560px;margin:0 auto;">
          <p style="color:#C8FF00;letter-spacing:0.2em;font-size:12px;text-transform:uppercase;margin-bottom:32px;">CRONIA</p>
          <h1 style="font-size:28px;font-weight:900;margin:0 0 16px;">Tu acceso está listo${name ? `, ${name}` : ''}.</h1>
          <p style="color:rgba(245,245,245,0.7);line-height:1.6;margin-bottom:32px;">
            Entra a tu panel privado de CRONIA. Ahí vas a encontrar tu progreso, tus accionables de la semana y tus recursos personalizados.
          </p>
          <a href="${link}" style="display:inline-block;background:#C8FF00;color:#000;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:16px 32px;font-size:14px;">
            Crear mi cuenta →
          </a>
          <p style="margin-top:40px;color:rgba(245,245,245,0.4);font-size:12px;">
            Este link expira en 7 días. Si no lo pediste, ignora este correo.
          </p>
        </body>
      </html>
    `,
  })
}

export async function sendCheckInReminderEmail(email: string, name: string, clientId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const link = `${appUrl}/dashboard/check-in`

  await resend.emails.send({
    from: 'CRONIA <hola@cronia.mx>',
    to: email,
    subject: 'Tu check-in semanal · menos de 5 minutos',
    html: `
      <!DOCTYPE html>
      <html>
        <body style="background:#000;color:#F5F5F5;font-family:sans-serif;padding:40px;max-width:560px;margin:0 auto;">
          <p style="color:#C8FF00;letter-spacing:0.2em;font-size:12px;text-transform:uppercase;margin-bottom:32px;">CRONIA</p>
          <h1 style="font-size:28px;font-weight:900;margin:0 0 16px;">Es viernes, ${name.split(' ')[0]}.</h1>
          <p style="color:rgba(245,245,245,0.7);line-height:1.6;margin-bottom:32px;">
            Tómate 5 minutos para registrar tu semana. Es la única forma de medir tu progreso real.
          </p>
          <a href="${link}" style="display:inline-block;background:#C8FF00;color:#000;font-weight:900;letter-spacing:0.1em;text-transform:uppercase;text-decoration:none;padding:16px 32px;font-size:14px;">
            Hacer mi check-in →
          </a>
          <p style="margin-top:40px;color:rgba(245,245,245,0.4);font-size:12px;">
            Enviado por Jorge · CRONIA · <a href="mailto:hola@cronia.mx" style="color:#C8FF00;">hola@cronia.mx</a>
          </p>
        </body>
      </html>
    `,
  })
}
