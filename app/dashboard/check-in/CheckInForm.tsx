'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface Props {
  clientId: string
  weekDate: string
  alreadyDone: boolean
  mainActionTitle?: string | null
}

type MainActionStatus = 'yes' | 'no' | 'none'

export default function CheckInForm({ clientId, weekDate, alreadyDone, mainActionTitle }: Props) {
  const router = useRouter()

  // Bloque 1: Percepción
  const [score, setScore] = useState<number | null>(null)
  const [feltControl, setFeltControl] = useState<boolean | null>(null)

  // Bloque 2: Tiempo
  const [meetingHours, setMeetingHours] = useState('')
  const [emailHours, setEmailHours] = useState('')
  const [repetitiveHours, setRepetitiveHours] = useState('')

  // Bloque 3: Fricción + Ejecución
  const [friction, setFriction] = useState('')
  const [mainAction, setMainAction] = useState<MainActionStatus | null>(null)

  // Bloque 4: Siguiente paso
  const [nextGoal, setNextGoal] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(alreadyDone)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (score === null || feltControl === null) {
      setError('Responde al menos las preguntas de percepción.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: err } = await supabase.from('check_ins').insert({
      client_id: clientId,
      week_date: weekDate,
      optimization_score: score,
      biggest_time_drain: friction || null,
      felt_control: feltControl,
      reported_email_hours: parseFloat(emailHours) || 0,
      reported_meeting_hours: parseFloat(meetingHours) || 0,
      reported_repetitive_hours: parseFloat(repetitiveHours) || 0,
      completed_main_action: mainAction === 'yes' ? true : mainAction === 'no' ? false : null,
      next_week_goal: nextGoal.trim() || null,
    })

    setLoading(false)
    if (err) { setError('Error al guardar. Intenta de nuevo.'); return }

    setDone(true)
    router.refresh()
  }

  // ── Done state ──────────────────────────────────────────────
  if (done) {
    return (
      <div
        className="py-16 border flex flex-col items-center gap-4 text-center"
        style={{ borderColor: 'rgba(200,255,0,0.25)', background: 'rgba(200,255,0,0.03)' }}
      >
        <div className="w-10 h-10 border-2 flex items-center justify-center" style={{ borderColor: '#C8FF00' }}>
          <svg viewBox="0 0 14 11" fill="none" width="14" height="11">
            <path d="M1 5.5L5 9.5L13 1.5" stroke="#C8FF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <p className="text-base font-black text-[#F5F5F5]">Check-in completado.</p>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,245,245,0.5)' }}>
            Perfecto. Con esto optimizamos tu siguiente semana.
          </p>
        </div>
      </div>
    )
  }

  // ── Form ────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-0 max-w-2xl">

      {/* ── Bloque 1: Percepción ── */}
      <Block number="01" label="Percepción">
        <Question title="¿Qué tan bien manejaste tu tiempo esta semana?">
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setScore(n)}
                className="w-12 h-12 text-sm font-black border transition-all"
                style={{
                  borderColor: score === n ? '#C8FF00' : 'rgba(255,255,255,0.1)',
                  background: score === n ? '#C8FF00' : 'transparent',
                  color: score === n ? '#000' : 'rgba(245,245,245,0.5)',
                }}
              >
                {n}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs mt-1.5" style={{ color: 'rgba(245,245,245,0.2)' }}>
            <span>Muy mal</span><span>Excelente</span>
          </div>
        </Question>

        <Question title="¿Sentiste control sobre tu agenda?">
          <div className="flex gap-3">
            {[{ label: 'Sí', val: true }, { label: 'No', val: false }].map(opt => (
              <button
                key={String(opt.val)}
                type="button"
                onClick={() => setFeltControl(opt.val)}
                className="px-8 py-3 text-sm font-black tracking-[0.08em] uppercase border transition-all"
                style={{
                  borderColor: feltControl === opt.val ? '#C8FF00' : 'rgba(255,255,255,0.1)',
                  background: feltControl === opt.val ? '#C8FF00' : 'transparent',
                  color: feltControl === opt.val ? '#000' : '#F5F5F5',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Question>
      </Block>

      {/* ── Bloque 2: Tiempo ── */}
      <Block number="02" label="Tiempo">
        <Question title="Esta semana invertí aproximadamente:">
          <div className="flex gap-8 flex-wrap">
            {[
              { label: 'Juntas', val: meetingHours, set: setMeetingHours },
              { label: 'Correos', val: emailHours, set: setEmailHours },
              { label: 'Tareas repetitivas', val: repetitiveHours, set: setRepetitiveHours },
            ].map(f => (
              <div key={f.label} className="flex flex-col gap-2">
                <label className="text-xs font-semibold tracking-[0.1em] uppercase" style={{ color: 'rgba(245,245,245,0.3)' }}>
                  {f.label}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    max="80"
                    step="0.5"
                    value={f.val}
                    onChange={e => f.set(e.target.value)}
                    placeholder="0"
                    className="w-20 bg-transparent border px-3 py-2.5 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] transition-colors text-center placeholder:opacity-20"
                    style={{ borderColor: 'rgba(255,255,255,0.12)' }}
                  />
                  <span className="text-xs" style={{ color: 'rgba(245,245,245,0.25)' }}>hrs</span>
                </div>
              </div>
            ))}
          </div>
        </Question>
      </Block>

      {/* ── Bloque 3: Fricción + Ejecución ── */}
      <Block number="03" label="Fricción y ejecución">
        <Question title="¿Qué actividad podrías delegar o eliminar esta semana?">
          <input
            type="text"
            value={friction}
            onChange={e => setFriction(e.target.value)}
            placeholder="Ej. revisar reportes que nadie lee..."
            className="w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] transition-colors placeholder:opacity-25"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
          />
        </Question>

        <Question
          title={
            mainActionTitle
              ? `¿Completaste "${mainActionTitle}"?`
              : '¿Completaste tu acción principal de la semana?'
          }
        >
          <div className="flex gap-3 flex-wrap">
            {[
              { label: 'Sí', val: 'yes' as MainActionStatus },
              { label: 'No', val: 'no' as MainActionStatus },
              { label: 'No tenía asignada', val: 'none' as MainActionStatus },
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setMainAction(opt.val)}
                className="px-5 py-2.5 text-sm font-black tracking-[0.08em] uppercase border transition-all"
                style={{
                  borderColor: mainAction === opt.val ? '#C8FF00' : 'rgba(255,255,255,0.1)',
                  background: mainAction === opt.val ? '#C8FF00' : 'transparent',
                  color: mainAction === opt.val ? '#000' : '#F5F5F5',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Question>
      </Block>

      {/* ── Bloque 4: Siguiente paso ── */}
      <Block number="04" label="Siguiente semana" last>
        <Question title="¿Qué quieres lograr la próxima semana?">
          <input
            type="text"
            value={nextGoal}
            onChange={e => setNextGoal(e.target.value)}
            placeholder="Una cosa concreta..."
            className="w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] transition-colors placeholder:opacity-25"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}
          />
        </Question>
      </Block>

      {/* ── Submit ── */}
      <div className="pt-6">
        {error && <p className="text-xs text-red-400 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-10 py-4 font-black text-xs tracking-[0.2em] uppercase transition-opacity disabled:opacity-50"
          style={{ background: '#C8FF00', color: '#000' }}
        >
          {loading ? 'Guardando...' : 'Enviar check-in →'}
        </button>
      </div>
    </form>
  )
}

function Block({ number, label, children, last }: {
  number: string
  label: string
  children: React.ReactNode
  last?: boolean
}) {
  return (
    <div
      className={`py-8 ${!last ? 'border-b' : ''}`}
      style={{ borderColor: 'rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs font-black" style={{ color: '#C8FF00' }}>{number}</span>
        <span className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: 'rgba(245,245,245,0.3)' }}>
          {label}
        </span>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>
      <div className="space-y-8 pl-6">
        {children}
      </div>
    </div>
  )
}

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold text-[#F5F5F5] leading-snug">{title}</p>
      {children}
    </div>
  )
}
