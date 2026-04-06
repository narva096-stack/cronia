import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendCheckInReminderEmail } from '@/lib/resend'

// Este endpoint se llama desde un cron job cada viernes
// Puedes configurarlo en Vercel Cron Jobs o en Supabase Edge Functions
// Protegido con un secret header
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  }

  const supabase = createAdminClient()

  // Obtener todos los clientes activos con su user info
  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, name, email')
    .eq('active', true)

  if (error || !clients) {
    return NextResponse.json({ error: 'Error obteniendo clientes.' }, { status: 500 })
  }

  const results = await Promise.allSettled(
    clients.map((client: { id: string; name: string; email: string }) =>
      sendCheckInReminderEmail(client.email, client.name, client.id)
    )
  )

  const sent = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected').length

  return NextResponse.json({ sent, failed })
}
