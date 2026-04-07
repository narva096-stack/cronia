'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient as createSupabase } from '@/lib/supabase/client'
import { calcWeeklyMetrics } from '@/lib/calculations'
import type { Client, Baseline, Session, ActionItem, Insight, Playbook, CheckIn } from '@/types'

interface Props {
  client: Client
  baseline: Baseline | null
  sessions: Session[]
  actionItems: ActionItem[]
  insights: Insight[]
  playbooks: Playbook[]
  checkIns: CheckIn[]
}

type Tab = 'overview' | 'baseline' | 'sessions' | 'actions' | 'insights' | 'playbooks'

export default function AdminClientForm(props: Props) {
  const { client, baseline, sessions, actionItems, insights, playbooks, checkIns } = props
  const [tab, setTab] = useState<Tab>('overview')
  const router = useRouter()

  const metrics = calcWeeklyMetrics(baseline, checkIns)

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Resumen' },
    { key: 'baseline', label: 'Baseline' },
    { key: 'sessions', label: 'Sesiones' },
    { key: 'actions', label: 'Accionables' },
    { key: 'insights', label: 'Insights' },
    { key: 'playbooks', label: 'Playbooks' },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <button
          onClick={() => router.push('/admin')}
          className="text-xs mb-3 block transition-colors hover:text-[#F5F5F5]"
          style={{ color: 'rgba(245,245,245,0.4)' }}
        >
          ← Todos los clientes
        </button>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-wide text-[#F5F5F5] uppercase">
              {client.name}
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(245,245,245,0.4)' }}>
              {client.email} {client.plan_price ? `· $${client.plan_price}/mes` : ''}
            </p>
          </div>
          <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 flex-shrink-0">
            <span
              className="text-xs font-semibold tracking-[0.1em] uppercase px-3 py-1.5"
              style={{
                background: client.active ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                color: client.active ? '#C8FF00' : 'rgba(245,245,245,0.4)',
              }}
            >
              {client.active ? 'Activo' : 'Inactivo'}
            </span>
            <DeleteClientButton clientId={client.id} clientName={client.name} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-5 py-3 text-xs font-semibold tracking-[0.1em] uppercase border-b-2 transition-all"
            style={{
              borderColor: tab === t.key ? '#C8FF00' : 'transparent',
              color: tab === t.key ? '#C8FF00' : 'rgba(245,245,245,0.4)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === 'overview' && <OverviewTab client={client} metrics={metrics} checkIns={checkIns} />}
      {tab === 'baseline' && <BaselineTab clientId={client.id} baseline={baseline} onSave={() => router.refresh()} />}
      {tab === 'sessions' && <SessionsTab clientId={client.id} sessions={sessions} onSave={() => router.refresh()} />}
      {tab === 'actions' && <ActionsTab clientId={client.id} actionItems={actionItems} onSave={() => router.refresh()} />}
      {tab === 'insights' && <InsightsTab clientId={client.id} insights={insights} onSave={() => router.refresh()} />}
      {tab === 'playbooks' && <PlaybooksTab clientId={client.id} playbooks={playbooks} onSave={() => router.refresh()} />}
    </div>
  )
}

// ─── Delete Client ────────────────────────────────────────────────────────────
function DeleteClientButton({ clientId, clientName }: { clientId: string; clientName: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`¿Borrar a ${clientName}? Esta acción no se puede deshacer.`)) return
    setLoading(true)
    const supabase = createSupabase()
    await supabase.from('clients').delete().eq('id', clientId)
    router.push('/admin')
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-xs font-semibold tracking-[0.1em] uppercase px-3 py-1.5 border transition-colors disabled:opacity-40"
      style={{ borderColor: 'rgba(255,80,80,0.3)', color: 'rgba(255,80,80,0.6)' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,80,80,0.7)'
        e.currentTarget.style.color = 'rgb(255,80,80)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,80,80,0.3)'
        e.currentTarget.style.color = 'rgba(255,80,80,0.6)'
      }}
    >
      {loading ? 'Borrando...' : 'Borrar cliente'}
    </button>
  )
}

// ─── Overview ────────────────────────────────────────────────────────────────
function OverviewTab({ client, metrics, checkIns }: {
  client: Client
  metrics: ReturnType<typeof calcWeeklyMetrics>
  checkIns: CheckIn[]
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Stat label="Horas recuperadas" value={`${metrics.hoursRecovered.toFixed(1)} hrs`} accent />
        <Stat label="Reducción operativa" value={`${metrics.operationalReduction}%`} />
        <Stat label="Score de control" value={metrics.controlScore > 0 ? `${metrics.controlScore}/5` : '—'} />
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <Stat label="Check-ins completados" value={String(metrics.totalCheckIns)} />
        <Stat label="Baseline total semanal" value={`${metrics.baselineTotal} hrs`} />
      </div>
      {checkIns.length > 0 && (
        <div>
          <p className="text-xs font-black tracking-[0.15em] uppercase mb-3"
            style={{ color: 'rgba(245,245,245,0.4)' }}>
            Últimos check-ins
          </p>
          <div className="space-y-2">
            {checkIns.slice(0, 4).map(ci => (
              <div key={ci.id} className="flex items-center gap-4 px-4 py-3 border"
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <p className="text-xs text-[#F5F5F5] flex-1">{ci.week_date}</p>
                <p className="text-xs" style={{ color: '#C8FF00' }}>{ci.optimization_score}/5</p>
                <p className="text-xs" style={{ color: 'rgba(245,245,245,0.4)' }}>
                  {ci.felt_control ? 'Control ✓' : 'Sin control'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="p-5 border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
      <p className="text-xs tracking-[0.12em] uppercase mb-2" style={{ color: 'rgba(245,245,245,0.4)' }}>
        {label}
      </p>
      <p className="text-2xl font-black" style={{ color: accent ? '#C8FF00' : '#F5F5F5' }}>
        {value}
      </p>
    </div>
  )
}

// ─── Baseline ────────────────────────────────────────────────────────────────
function BaselineTab({ clientId, baseline, onSave }: {
  clientId: string
  baseline: Baseline | null
  onSave: () => void
}) {
  const [email, setEmail] = useState(String(baseline?.weekly_email_hours ?? ''))
  const [meetings, setMeetings] = useState(String(baseline?.weekly_meeting_hours ?? ''))
  const [repetitive, setRepetitive] = useState(String(baseline?.weekly_repetitive_hours ?? ''))
  const [research, setResearch] = useState(String(baseline?.weekly_research_hours ?? ''))
  const [content, setContent] = useState(String(baseline?.weekly_content_hours ?? ''))
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    const supabase = createSupabase()
    const data = {
      client_id: clientId,
      weekly_email_hours: parseFloat(email) || 0,
      weekly_meeting_hours: parseFloat(meetings) || 0,
      weekly_repetitive_hours: parseFloat(repetitive) || 0,
      weekly_research_hours: parseFloat(research) || 0,
      weekly_content_hours: parseFloat(content) || 0,
    }

    if (baseline) {
      await supabase.from('baselines').update(data).eq('client_id', clientId)
    } else {
      await supabase.from('baselines').insert(data)
    }

    setSaved(true)
    setLoading(false)
    setTimeout(() => { setSaved(false); onSave() }, 1500)
  }

  const fields = [
    { label: 'Horas semanales en correos', val: email, set: setEmail },
    { label: 'Horas semanales en juntas', val: meetings, set: setMeetings },
    { label: 'Horas en tareas repetitivas', val: repetitive, set: setRepetitive },
    { label: 'Horas en investigación', val: research, set: setResearch },
    { label: 'Horas en creación de contenido', val: content, set: setContent },
  ]

  return (
    <div className="space-y-4 max-w-md">
      <p className="text-xs" style={{ color: 'rgba(245,245,245,0.4)' }}>
        Horas semanales ANTES de trabajar con Cronia. Sirven de base para calcular el progreso.
      </p>
      {fields.map(f => (
        <div key={f.label}>
          <label className="block text-xs font-semibold tracking-[0.12em] uppercase mb-2"
            style={{ color: 'rgba(245,245,245,0.5)' }}>
            {f.label}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number" min="0" max="80" step="0.5"
              value={f.val}
              onChange={e => f.set(e.target.value)}
              className="w-24 bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00]"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            />
            <span className="text-xs" style={{ color: 'rgba(245,245,245,0.4)' }}>hrs/semana</span>
          </div>
        </div>
      ))}
      <button
        onClick={handleSave}
        disabled={loading}
        className="px-6 py-3 text-xs font-black tracking-[0.15em] uppercase disabled:opacity-50"
        style={{ background: saved ? 'rgba(200,255,0,0.2)' : '#C8FF00', color: saved ? '#C8FF00' : '#000', border: saved ? '1px solid #C8FF00' : 'none' }}
      >
        {saved ? 'Guardado ✓' : loading ? 'Guardando...' : 'Guardar baseline'}
      </button>
    </div>
  )
}

// ─── Sessions ────────────────────────────────────────────────────────────────
function SessionsTab({ clientId, sessions, onSave }: {
  clientId: string
  sessions: Session[]
  onSave: () => void
}) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!date || !time) return
    setLoading(true)
    const supabase = createSupabase()
    await supabase.from('sessions').insert({
      client_id: clientId,
      scheduled_at: new Date(`${date}T${time}`).toISOString(),
      notes: notes || null,
      status: 'scheduled',
    })
    setDate(''); setTime(''); setNotes('')
    setLoading(false)
    onSave()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 max-w-md">
        <p className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: 'rgba(245,245,245,0.4)' }}>
          Agendar nueva sesión
        </p>
        <div className="flex gap-3">
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00]"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
          <input type="time" value={time} onChange={e => setTime(e.target.value)}
            className="bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00]"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        </div>
        <input type="text" placeholder="Notas (opcional)" value={notes} onChange={e => setNotes(e.target.value)}
          className="w-full bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <button onClick={handleAdd} disabled={loading || !date || !time}
          className="px-5 py-2.5 text-xs font-black tracking-[0.12em] uppercase disabled:opacity-40"
          style={{ background: '#C8FF00', color: '#000' }}>
          {loading ? 'Agregando...' : 'Agendar sesión'}
        </button>
      </div>

      <div className="space-y-2">
        {sessions.map(s => (
          <div key={s.id} className="flex items-center gap-4 px-4 py-3 border"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#F5F5F5] capitalize">
                {new Date(s.scheduled_at).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' · '}
                {new Date(s.scheduled_at).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
              </p>
              {s.notes && <p className="text-xs mt-0.5" style={{ color: 'rgba(245,245,245,0.4)' }}>{s.notes}</p>}
            </div>
            <span className="text-xs px-2 py-1" style={{
              background: s.status === 'scheduled' ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.05)',
              color: s.status === 'scheduled' ? '#C8FF00' : 'rgba(245,245,245,0.4)',
            }}>
              {s.status === 'scheduled' ? 'Agendada' : s.status === 'completed' ? 'Completada' : 'Cancelada'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Actions ─────────────────────────────────────────────────────────────────
function ActionsTab({ clientId, actionItems, onSave }: {
  clientId: string
  actionItems: ActionItem[]
  onSave: () => void
}) {
  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [day, setDay] = useState<'lun' | 'mar' | 'mie' | 'jue' | 'vie'>('lun')
  const [mins, setMins] = useState('')
  const [link, setLink] = useState('')
  const [weekDate, setWeekDate] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!title || !weekDate) return
    setLoading(true)
    const supabase = createSupabase()
    await supabase.from('action_items').insert({
      client_id: clientId,
      week_date: weekDate,
      day,
      title,
      description: desc || null,
      estimated_minutes: parseInt(mins) || null,
      prompt_link: link || null,
    })
    setTitle(''); setDesc(''); setMins(''); setLink('')
    setLoading(false)
    onSave()
  }

  const days = ['lun', 'mar', 'mie', 'jue', 'vie'] as const

  return (
    <div className="space-y-6">
      <div className="space-y-3 max-w-lg">
        <p className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: 'rgba(245,245,245,0.4)' }}>
          Agregar accionable
        </p>
        <div className="flex gap-3">
          <input type="date" value={weekDate} onChange={e => setWeekDate(e.target.value)}
            className="bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00]"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
          <select value={day} onChange={e => setDay(e.target.value as typeof day)}
            className="bg-black border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00]"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
            {days.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
          </select>
        </div>
        <input type="text" placeholder="Título del accionable" value={title} onChange={e => setTitle(e.target.value)}
          className="w-full bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <input type="text" placeholder="Descripción (opcional)" value={desc} onChange={e => setDesc(e.target.value)}
          className="w-full bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <div className="flex gap-3">
          <input type="number" placeholder="Min estimados" value={mins} onChange={e => setMins(e.target.value)}
            className="w-36 bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
          <input type="url" placeholder="Link de prompt (opcional)" value={link} onChange={e => setLink(e.target.value)}
            className="flex-1 bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        </div>
        <button onClick={handleAdd} disabled={loading || !title || !weekDate}
          className="px-5 py-2.5 text-xs font-black tracking-[0.12em] uppercase disabled:opacity-40"
          style={{ background: '#C8FF00', color: '#000' }}>
          {loading ? 'Agregando...' : 'Agregar'}
        </button>
      </div>

      <div className="space-y-2">
        {actionItems.map(a => (
          <div key={a.id} className="flex items-center gap-4 px-4 py-3 border"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <span className="text-xs font-black text-[#C8FF00] w-8">{a.day.toUpperCase()}</span>
            <div className="flex-1">
              <p className="text-sm text-[#F5F5F5]">{a.title}</p>
              {a.estimated_minutes && <p className="text-xs" style={{ color: 'rgba(245,245,245,0.4)' }}>~{a.estimated_minutes} min</p>}
            </div>
            <span className="text-xs" style={{ color: 'rgba(245,245,245,0.3)' }}>{a.week_date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Insights ────────────────────────────────────────────────────────────────
function InsightsTab({ clientId, insights, onSave }: {
  clientId: string
  insights: Insight[]
  onSave: () => void
}) {
  const [content, setContent] = useState('')
  const [weekDate, setWeekDate] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!content || !weekDate) return
    setLoading(true)
    const supabase = createSupabase()
    await supabase.from('insights').insert({ client_id: clientId, week_date: weekDate, content })
    setContent(''); setWeekDate('')
    setLoading(false)
    onSave()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 max-w-lg">
        <p className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: 'rgba(245,245,245,0.4)' }}>
          Nuevo insight
        </p>
        <input type="date" value={weekDate} onChange={e => setWeekDate(e.target.value)}
          className="bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00]"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <textarea value={content} onChange={e => setContent(e.target.value)}
          placeholder="Escribe el insight de esta semana para el cliente..."
          rows={4}
          className="w-full bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30 resize-none"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <button onClick={handleAdd} disabled={loading || !content || !weekDate}
          className="px-5 py-2.5 text-xs font-black tracking-[0.12em] uppercase disabled:opacity-40"
          style={{ background: '#C8FF00', color: '#000' }}>
          {loading ? 'Guardando...' : 'Guardar insight'}
        </button>
      </div>
      <div className="space-y-2">
        {insights.map(i => (
          <div key={i.id} className="px-4 py-4 border" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-xs mb-2" style={{ color: '#C8FF00' }}>{i.week_date}</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(245,245,245,0.7)' }}>{i.content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Playbooks ────────────────────────────────────────────────────────────────
function PlaybooksTab({ clientId, playbooks, onSave }: {
  clientId: string
  playbooks: Playbook[]
  onSave: () => void
}) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [promptContent, setPromptContent] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleAdd() {
    if (!title || !promptContent) return
    setLoading(true)
    const supabase = createSupabase()
    await supabase.from('playbooks').insert({
      client_id: clientId,
      title,
      category: category || 'General',
      description: description || null,
      prompt_content: promptContent,
    })
    setTitle(''); setCategory(''); setDescription(''); setPromptContent('')
    setLoading(false)
    onSave()
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 max-w-lg">
        <p className="text-xs font-black tracking-[0.15em] uppercase" style={{ color: 'rgba(245,245,245,0.4)' }}>
          Nuevo playbook / prompt
        </p>
        <div className="flex gap-3">
          <input type="text" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)}
            className="flex-1 bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
          <input type="text" placeholder="Categoría" value={category} onChange={e => setCategory(e.target.value)}
            className="w-36 bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
            style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        </div>
        <input type="text" placeholder="Descripción breve (opcional)" value={description} onChange={e => setDescription(e.target.value)}
          className="w-full bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <textarea value={promptContent} onChange={e => setPromptContent(e.target.value)}
          placeholder="Pega aquí el prompt completo..."
          rows={6}
          className="w-full bg-transparent border px-3 py-2 text-sm text-[#F5F5F5] font-mono outline-none focus:border-[#C8FF00] placeholder:opacity-30 resize-none"
          style={{ borderColor: 'rgba(255,255,255,0.12)' }} />
        <button onClick={handleAdd} disabled={loading || !title || !promptContent}
          className="px-5 py-2.5 text-xs font-black tracking-[0.12em] uppercase disabled:opacity-40"
          style={{ background: '#C8FF00', color: '#000' }}>
          {loading ? 'Guardando...' : 'Guardar playbook'}
        </button>
      </div>
      <div className="space-y-2">
        {playbooks.map(p => (
          <div key={p.id} className="flex items-center gap-4 px-4 py-3 border"
            style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#F5F5F5]">{p.title}</p>
              <p className="text-xs" style={{ color: '#C8FF00' }}>{p.category}</p>
            </div>
            <p className="text-xs" style={{ color: 'rgba(245,245,245,0.3)' }}>
              {p.prompt_content.slice(0, 50)}...
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
