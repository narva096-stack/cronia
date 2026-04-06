import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CheckInForm from './CheckInForm'
import CheckInHistory from './CheckInHistory'
import ContactBar from '@/components/dashboard/ContactBar'
import { getCurrentWeekMonday } from '@/lib/calculations'
import type { CheckIn, ActionItem } from '@/types'

export default async function CheckInPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients').select('id').eq('user_id', user.id).single()

  const { data: profile } = await supabase
    .from('profiles').select('name').eq('id', user.id).single()

  if (!client) return null

  const weekMonday = getCurrentWeekMonday()

  const weekEnd = new Date(weekMonday + 'T12:00:00')
  weekEnd.setDate(weekEnd.getDate() + 4)
  const weekEndLabel = weekEnd.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })
  const weekStartLabel = new Date(weekMonday + 'T12:00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

  const [thisWeekRes, historyRes, mainActionRes] = await Promise.all([
    supabase
      .from('check_ins')
      .select('*')
      .eq('client_id', client.id)
      .eq('week_date', weekMonday)
      .single(),
    supabase
      .from('check_ins')
      .select('*')
      .eq('client_id', client.id)
      .order('week_date', { ascending: false })
      .limit(8),
    // Trae la acción principal de esta semana para la pregunta contextual
    supabase
      .from('action_items')
      .select('title')
      .eq('client_id', client.id)
      .eq('week_date', weekMonday)
      .eq('completed', false)
      .order('day', { ascending: true })
      .limit(1)
      .single(),
  ])

  const thisWeekCheckIn = thisWeekRes.data as CheckIn | null
  const history = (historyRes.data ?? []) as CheckIn[]
  const mainAction = mainActionRes.data as Pick<ActionItem, 'title'> | null

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
          style={{ color: 'rgba(245,245,245,0.3)' }}>
          {weekStartLabel} — {weekEndLabel}
        </p>
        <h1 className="text-4xl font-black tracking-tight text-[#F5F5F5] uppercase leading-none">
          Check-in.
        </h1>
        <p className="text-sm mt-2" style={{ color: 'rgba(245,245,245,0.4)' }}>
          2–3 minutos. Cada viernes. Alimenta tus métricas.
        </p>
      </div>

      <CheckInForm
        clientId={client.id}
        weekDate={weekMonday}
        alreadyDone={!!thisWeekCheckIn}
        mainActionTitle={mainAction?.title ?? null}
      />

      {history.length > 1 && (
        <CheckInHistory checkIns={history} />
      )}

      <ContactBar clientName={profile?.name ?? ''} />
    </div>
  )
}
