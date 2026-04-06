import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendInvitationEmail } from '@/lib/resend'

// GET: validar token de invitación (usado en /register)
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.json({ error: 'Token requerido.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Invitación no encontrada.' }, { status: 404 })
  }

  if (data.used) {
    return NextResponse.json({ error: 'Esta invitación ya fue usada.' }, { status: 400 })
  }

  if (new Date(data.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Esta invitación expiró.' }, { status: 400 })
  }

  return NextResponse.json({ email: data.email })
}

// POST: crear nueva invitación (solo admin)
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { email } = body

  if (!email) {
    return NextResponse.json({ error: 'Correo requerido.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  // Crear invitación
  const { data, error } = await supabase
    .from('invitations')
    .insert({ email })
    .select()
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Error al crear invitación.' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL
  const link = `${appUrl}/register?token=${data.token}`

  // Enviar correo
  try {
    await sendInvitationEmail(email, data.token)
  } catch (e) {
    // No bloqueamos si el email falla — el link ya está generado
    console.error('Error enviando email de invitación:', e)
  }

  return NextResponse.json({ link, token: data.token })
}

// PATCH: marcar invitación como usada
export async function PATCH(request: NextRequest) {
  const body = await request.json()
  const { token } = body

  if (!token) {
    return NextResponse.json({ error: 'Token requerido.' }, { status: 400 })
  }

  const supabase = createAdminClient()
  await supabase.from('invitations').update({ used: true }).eq('token', token)

  return NextResponse.json({ ok: true })
}
