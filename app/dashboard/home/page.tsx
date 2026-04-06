import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ContactBar from '@/components/dashboard/ContactBar'
import { calcWeeklyMetrics } from '@/lib/calculations'
import type { Baseline, CheckIn, Session, ActionItem, Insight } from '@/types'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients').select('*').eq('user_id', user.id).single()

  const { data: profile } = await supabase
    .from('profiles').select('name').eq('id', user.id).single()

  const name = profile?.name?.split(' ')[0] ?? 'Cliente'

  if (!client) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-sm" style={{ color: 'rgba(245,245,245,0.4)' }}>
          Tu perfil está siendo configurado. Vuelve pronto.
        </p>
      </div>
    )
  }

  const [baselineRes, checkInsRes, sessionRes, actionsRes, insightRes] = await Promise.all([
    supabase.from('baselines').select('*').eq('client_id', client.id).single(),
    supabase.from('check_ins').select('*').eq('client_id', client.id).order('week_date', { ascending: false }),
    supabase.from('sessions').select('*').eq('client_id', client.id).eq('status', 'scheduled')
      .gte('scheduled_at', new Date().toISOString()).order('scheduled_at', { ascending: true }).limit(1).single(),
    supabase.from('action_items').select('*').eq('client_id', client.id).eq('completed', false)
      .order('week_date', { ascending: false }).limit(1).single(),
    supabase.from('insights').select('*').eq('client_id', client.id)
      .order('week_date', { ascending: false }).limit(1).single(),
  ])

  const baseline = baselineRes.data as Baseline | null
  const checkIns = (checkInsRes.data ?? []) as CheckIn[]
  const nextSession = sessionRes.data as Session | null
  const todayAction = actionsRes.data as ActionItem | null
  const latestInsight = insightRes.data as Insight | null

  const metrics = calcWeeklyMetrics(baseline, checkIns)
  const hasData = checkIns.length > 0

  const todayLabel = new Date().toLocaleDateString('es-MX', {
    weekday: 'long', day: 'numeric', month: 'long',
  })

  // Métricas con copy contextual cuando no hay datos
  const heroValue = metrics.hoursRecovered > 0 ? metrics.hoursRecovered.toFixed(1) : null
  const reductionValue = metrics.operationalReduction > 0 ? `${metrics.operationalReduction}%` : null
  const controlValue = metrics.controlScore > 0 ? `${metrics.controlScore}/5` : null

  return (
    <div className="space-y-5 md:space-y-8 pt-16 md:pt-0">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-2 capitalize"
            style={{ color: 'rgba(245,245,245,0.25)' }}>
            {todayLabel}
          </p>
          <h1 className="text-4xl font-black tracking-tight text-[#F5F5F5] uppercase leading-none">
            Hola, {name}.
          </h1>
        </div>
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

      {/* ── Hero métrica ── */}
      <div
        className="p-5 md:p-8 border flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8"
        style={{ borderColor: 'rgba(200,255,0,0.15)', background: 'rgba(200,255,0,0.02)' }}
      >
        {/* Horas — hero */}
        <div className="flex-shrink-0">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-3"
            style={{ color: 'rgba(245,245,245,0.35)' }}>
            Horas de vida recuperadas
          </p>
          {heroValue ? (
            <div className="flex items-end gap-2">
              <span className="text-6xl font-black leading-none" style={{ color: '#C8FF00' }}>
                {heroValue}
              </span>
              <span className="text-xl mb-1 font-semibold" style={{ color: 'rgba(200,255,0,0.45)' }}>hrs</span>
            </div>
          ) : (
            <div>
              <p className="text-4xl font-black leading-none" style={{ color: 'rgba(200,255,0,0.25)' }}>—</p>
              <p className="text-xs mt-2" style={{ color: 'rgba(245,245,245,0.25)' }}>
                {hasData ? 'Completa tu baseline para ver el cálculo.' : 'Aparece después de tu primer check-in.'}
              </p>
            </div>
          )}
          {heroValue && (
            <p className="text-xs mt-2" style={{ color: 'rgba(245,245,245,0.25)' }}>
              acumulado desde que empezamos juntos
            </p>
          )}
        </div>

        <div className="hidden md:block h-16 w-px flex-shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* 3 métricas secundarias */}
        <div className="grid grid-cols-3 gap-4 md:gap-10 md:flex-1">
          {[
            {
              label: 'Reducción operativa',
              value: reductionValue,
              sub: 'vs tu baseline',
              empty: 'tras 1er check-in',
            },
            {
              label: 'Control promedio',
              value: controlValue,
              sub: 'promedio semanal',
              empty: 'tras 1er check-in',
            },
            {
              label: 'Check-ins',
              value: metrics.totalCheckIns > 0 ? String(metrics.totalCheckIns) : null,
              sub: 'semanas registradas',
              empty: 'este viernes',
            },
          ].map(m => (
            <div key={m.label}>
              <p className="text-xs tracking-[0.12em] uppercase mb-2" style={{ color: 'rgba(245,245,245,0.3)' }}>
                {m.label}
              </p>
              {m.value ? (
                <>
                  <p className="text-3xl font-black text-[#F5F5F5]">{m.value}</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(245,245,245,0.2)' }}>{m.sub}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-black" style={{ color: 'rgba(245,245,245,0.15)' }}>—</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(245,245,245,0.2)' }}>{m.empty}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Foco + Insight ── */}
      {/* Foco ocupa 7/12, insight 5/12 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Tu foco ahora — protagonista */}
        <div className="col-span-1 md:col-span-7">
          {todayAction ? (
            <div
              className="h-full p-7 border flex flex-col gap-4"
              style={{
                borderColor: 'rgba(200,255,0,0.2)',
                background: 'rgba(200,255,0,0.025)',
              }}
            >
              <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: '#C8FF00' }}>
                Tu foco ahora
              </p>
              <div className="flex-1">
                <p className="text-xl font-black text-[#F5F5F5] leading-snug">{todayAction.title}</p>
                {todayAction.description && (
                  <p className="text-sm mt-2 leading-relaxed" style={{ color: 'rgba(245,245,245,0.55)' }}>
                    {todayAction.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'rgba(200,255,0,0.1)' }}>
                {todayAction.estimated_minutes ? (
                  <span className="text-xs font-semibold" style={{ color: 'rgba(200,255,0,0.5)' }}>
                    ~{todayAction.estimated_minutes} min
                  </span>
                ) : <span />}
                {todayAction.prompt_link ? (
                  <a
                    href={todayAction.prompt_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-black tracking-[0.12em] uppercase px-5 py-2.5 transition-opacity hover:opacity-80"
                    style={{ background: '#C8FF00', color: '#000' }}
                  >
                    Usar prompt →
                  </a>
                ) : (
                  <a
                    href="/dashboard/playbooks"
                    className="text-xs font-semibold tracking-[0.1em] uppercase transition-colors hover:text-[#C8FF00]"
                    style={{ color: 'rgba(245,245,245,0.35)' }}
                  >
                    Ver playbooks →
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div
              className="h-full p-7 border flex flex-col justify-center gap-3"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
            >
              <p className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(245,245,245,0.2)' }}>
                Tu foco ahora
              </p>
              <p className="text-base font-black" style={{ color: 'rgba(245,245,245,0.2)' }}>
                Sin acción asignada esta semana.
              </p>
              <p className="text-xs" style={{ color: 'rgba(245,245,245,0.2)' }}>
                Jorge te cargará tus accionables después de la sesión.
              </p>
            </div>
          )}
        </div>

        {/* Insight — subordinado */}
        <div className="col-span-1 md:col-span-5">
          <div
            className="h-full p-6 border-l-2 border flex flex-col gap-3"
            style={{
              borderLeftColor: 'rgba(200,255,0,0.3)',
              borderColor: 'rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.015)',
            }}
          >
            <p className="text-xs font-semibold tracking-[0.15em] uppercase" style={{ color: 'rgba(200,255,0,0.5)' }}>
              Insight
            </p>
            <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(245,245,245,0.65)' }}>
              {latestInsight?.content ?? 'Tu primer insight aparecerá después de tu primera sesión.'}
            </p>
            {latestInsight?.week_date && (
              <p className="text-xs" style={{ color: 'rgba(245,245,245,0.18)' }}>
                {new Date(latestInsight.week_date + 'T12:00:00').toLocaleDateString('es-MX', {
                  day: 'numeric', month: 'long',
                })}
              </p>
            )}
          </div>
        </div>
      </div>

      <ContactBar clientName={profile?.name ?? ''} />
    </div>
  )
}
