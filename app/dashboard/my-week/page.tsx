import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContactBar from '@/components/dashboard/ContactBar'
import ActionRow from './ActionRow'
import { getCurrentWeekMonday } from '@/lib/calculations'
import type { ActionItem, Session } from '@/types'

const DAYS = [
  { key: 'lun', label: 'Lunes' },
  { key: 'mar', label: 'Martes' },
  { key: 'mie', label: 'Miércoles' },
  { key: 'jue', label: 'Jueves' },
  { key: 'vie', label: 'Viernes' },
] as const

// Which day key corresponds to today (Mon=lun, Tue=mar, ...)
function getTodayKey(): string | null {
  const map: Record<number, string> = { 1: 'lun', 2: 'mar', 3: 'mie', 4: 'jue', 5: 'vie' }
  return map[new Date().getDay()] ?? null
}

export default async function MyWeekPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients').select('id').eq('user_id', user.id).single()

  const { data: profile } = await supabase
    .from('profiles').select('name').eq('id', user.id).single()

  if (!client) return null

  const weekMonday = getCurrentWeekMonday()

  const [actionsRes, sessionRes] = await Promise.all([
    supabase
      .from('action_items')
      .select('*')
      .eq('client_id', client.id)
      .eq('week_date', weekMonday)
      .order('day', { ascending: true }),
    supabase
      .from('sessions')
      .select('*')
      .eq('client_id', client.id)
      .eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .single(),
  ])

  const actions = (actionsRes.data ?? []) as ActionItem[]
  const nextSession = sessionRes.data as Session | null

  const actionsByDay = DAYS.reduce((acc, d) => {
    acc[d.key] = actions.filter(a => a.day === d.key)
    return acc
  }, {} as Record<string, ActionItem[]>)

  const todayKey = getTodayKey()
  const completedCount = actions.filter(a => a.completed).length
  const totalCount = actions.length

  const weekLabel = new Date(weekMonday + 'T12:00:00').toLocaleDateString('es-MX', {
    day: 'numeric', month: 'long',
  })
  const weekEnd = new Date(weekMonday + 'T12:00:00')
  weekEnd.setDate(weekEnd.getDate() + 4)
  const weekEndLabel = weekEnd.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })

  return (
    <div className="space-y-8 max-w-4xl">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2"
            style={{ color: 'rgba(245,245,245,0.3)' }}>
            {weekLabel} — {weekEndLabel}
          </p>
          <h1 className="text-4xl font-black tracking-tight text-[#F5F5F5] uppercase leading-none">
            Mi semana.
          </h1>
        </div>

        <div className="flex items-end gap-8">
          {/* Progress */}
          {totalCount > 0 && (
            <div className="text-right">
              <p className="text-xs tracking-[0.12em] uppercase mb-1" style={{ color: 'rgba(245,245,245,0.3)' }}>
                Progreso
              </p>
              <p className="text-2xl font-black" style={{ color: completedCount === totalCount ? '#C8FF00' : '#F5F5F5' }}>
                {completedCount}
                <span className="text-base font-semibold" style={{ color: 'rgba(245,245,245,0.3)' }}>
                  /{totalCount}
                </span>
              </p>
            </div>
          )}

          {/* Próxima sesión */}
          {nextSession && (
            <div className="text-right">
              <p className="text-xs tracking-[0.12em] uppercase mb-1" style={{ color: '#C8FF00' }}>
                Próxima sesión
              </p>
              <p className="text-sm font-bold text-[#F5F5F5] capitalize">
                {new Date(nextSession.scheduled_at).toLocaleDateString('es-MX', {
                  weekday: 'long', day: 'numeric', month: 'short',
                })}{' · '}
                {new Date(nextSession.scheduled_at).toLocaleTimeString('es-MX', {
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {DAYS.map((day, idx) => {
          const dayActions = actionsByDay[day.key]
          const isLast = idx === DAYS.length - 1
          const isToday = day.key === todayKey
          const allDone = dayActions.length > 0 && dayActions.every(a => a.completed)

          return (
            <div
              key={day.key}
              className={`flex ${!isLast ? 'border-b' : ''}`}
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: isToday ? 'rgba(200,255,0,0.025)' : 'transparent',
              }}
            >
              {/* Día */}
              <div
                className="w-32 flex-shrink-0 px-5 py-5 border-r flex flex-col gap-1"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <p
                  className="text-xs font-black tracking-[0.15em] uppercase"
                  style={{ color: isToday ? '#C8FF00' : allDone ? 'rgba(245,245,245,0.3)' : '#F5F5F5' }}
                >
                  {day.label}
                </p>
                {isToday && (
                  <p className="text-xs" style={{ color: 'rgba(200,255,0,0.5)' }}>hoy</p>
                )}
                {allDone && !isToday && (
                  <p className="text-xs" style={{ color: 'rgba(200,255,0,0.4)' }}>✓ listo</p>
                )}
              </div>

              {/* Accionables */}
              <div className="flex-1 px-6 py-4 space-y-4">
                {dayActions.length === 0 ? (
                  <p className="text-xs py-1" style={{ color: 'rgba(245,245,245,0.15)' }}>
                    —
                  </p>
                ) : (
                  dayActions.map(action => (
                    <ActionRow key={action.id} action={action as ActionItem} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>

      {actions.length === 0 && (
        <p className="text-sm text-center py-4" style={{ color: 'rgba(245,245,245,0.25)' }}>
          Tus accionables aparecerán aquí después de tu próxima sesión con Jorge.
        </p>
      )}

      <ContactBar clientName={profile?.name ?? ''} />
    </div>
  )
}
