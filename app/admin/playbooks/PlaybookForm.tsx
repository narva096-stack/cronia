'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Client, Playbook } from '@/types'

interface Props {
  clients: Pick<Client, 'id' | 'name'>[]
  playbook?: Playbook
}

const CATEGORIES = [
  'Productividad',
  'Comunicación',
  'Delegación',
  'Automatización',
  'Estrategia',
  'General',
]

export default function PlaybookForm({ clients, playbook }: Props) {
  const isEdit = !!playbook
  const router = useRouter()

  const [clientId, setClientId] = useState(playbook?.client_id ?? '')
  const [title, setTitle] = useState(playbook?.title ?? '')
  const [objective, setObjective] = useState(playbook?.objective ?? '')
  const [description, setDescription] = useState(playbook?.description ?? '')
  const [promptContent, setPromptContent] = useState(playbook?.prompt_content ?? '')
  const [whenToUse, setWhenToUse] = useState(playbook?.when_to_use ?? '')
  const [category, setCategory] = useState(playbook?.category ?? 'General')
  const [isActive, setIsActive] = useState(playbook?.is_active ?? true)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  function validate() {
    if (!clientId) return 'Selecciona un cliente.'
    if (!title.trim()) return 'El título es obligatorio.'
    if (!promptContent.trim()) return 'El prompt es obligatorio.'
    return null
  }

  async function handleSave() {
    const err = validate()
    if (err) { setError(err); return }

    setSaving(true)
    setError('')
    const supabase = createClient()

    const payload = {
      client_id: clientId,
      title: title.trim(),
      objective: objective.trim() || null,
      description: description.trim() || null,
      prompt_content: promptContent.trim(),
      when_to_use: whenToUse.trim() || null,
      category,
      is_active: isActive,
    }

    let saveError
    if (isEdit) {
      const { error } = await supabase.from('playbooks').update(payload).eq('id', playbook.id)
      saveError = error
    } else {
      const { error } = await supabase.from('playbooks').insert(payload)
      saveError = error
    }

    setSaving(false)
    if (saveError) { setError('Error al guardar. Intenta de nuevo.'); return }

    setSaved(true)
    setTimeout(() => {
      router.push('/admin/playbooks')
      router.refresh()
    }, 800)
  }

  async function handleDelete() {
    if (!isEdit) return
    if (!confirm(`¿Eliminar "${playbook.title}"? Esta acción no se puede deshacer.`)) return

    setDeleting(true)
    const supabase = createClient()
    await supabase.from('playbooks').delete().eq('id', playbook.id)
    router.push('/admin/playbooks')
    router.refresh()
  }

  const inputClass = "w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] transition-colors placeholder:opacity-30"
  const inputStyle = { borderColor: 'rgba(255,255,255,0.12)' }
  const labelClass = "block text-xs font-black tracking-[0.12em] uppercase mb-2"
  const labelStyle = { color: 'rgba(245,245,245,0.45)' }

  return (
    <div className="max-w-2xl space-y-6">

      {/* Cliente */}
      <div>
        <label className={labelClass} style={labelStyle}>Cliente *</label>
        <select
          value={clientId}
          onChange={e => setClientId(e.target.value)}
          className={inputClass}
          style={{ ...inputStyle, background: 'rgba(0,0,0,0.4)' }}
        >
          <option value="">— Seleccionar cliente —</option>
          {clients.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Título */}
      <div>
        <label className={labelClass} style={labelStyle}>Título *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Ej. Resumen de inbox en 20 minutos"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Objetivo */}
      <div>
        <label className={labelClass} style={labelStyle}>Objetivo</label>
        <input
          type="text"
          value={objective}
          onChange={e => setObjective(e.target.value)}
          placeholder="1 línea. Qué logra este prompt."
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Descripción */}
      <div>
        <label className={labelClass} style={labelStyle}>Descripción</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Contexto adicional. Máximo 2 líneas."
          rows={2}
          className={inputClass + ' resize-none'}
          style={inputStyle}
        />
      </div>

      {/* Prompt */}
      <div>
        <label className={labelClass} style={labelStyle}>Prompt * <span className="font-normal normal-case" style={{ color: 'rgba(245,245,245,0.3)' }}>— el texto completo que el cliente copiará</span></label>
        <textarea
          value={promptContent}
          onChange={e => setPromptContent(e.target.value)}
          placeholder="Pega aquí el prompt completo..."
          rows={10}
          className={inputClass + ' resize-none font-mono'}
          style={inputStyle}
        />
        {promptContent.length > 0 && (
          <p className="text-xs mt-1" style={{ color: 'rgba(245,245,245,0.25)' }}>
            {promptContent.length} caracteres
          </p>
        )}
      </div>

      {/* Cuándo usarlo */}
      <div>
        <label className={labelClass} style={labelStyle}>¿Cuándo usarlo?</label>
        <input
          type="text"
          value={whenToUse}
          onChange={e => setWhenToUse(e.target.value)}
          placeholder="Ej. Cada mañana antes de abrir el correo"
          className={inputClass}
          style={inputStyle}
        />
      </div>

      {/* Categoría + Activo */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className={labelClass} style={labelStyle}>Categoría</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className={inputClass}
            style={{ ...inputStyle, background: 'rgba(0,0,0,0.4)' }}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>Estado</label>
          <button
            type="button"
            onClick={() => setIsActive(v => !v)}
            className="flex items-center gap-3 border px-4 py-3 text-sm font-semibold transition-all"
            style={{
              borderColor: isActive ? 'rgba(200,255,0,0.3)' : 'rgba(255,255,255,0.12)',
              background: isActive ? 'rgba(200,255,0,0.07)' : 'transparent',
              color: isActive ? '#C8FF00' : 'rgba(245,245,245,0.4)',
            }}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ background: isActive ? '#C8FF00' : 'rgba(245,245,245,0.2)' }}
            />
            {isActive ? 'Activo' : 'Inactivo'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving || saved}
            className="px-8 py-3 text-xs font-black tracking-[0.15em] uppercase transition-all disabled:opacity-60"
            style={{
              background: saved ? 'rgba(200,255,0,0.15)' : '#C8FF00',
              color: saved ? '#C8FF00' : '#000',
              border: saved ? '1px solid #C8FF00' : 'none',
            }}
          >
            {saved ? 'Guardado ✓' : saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear playbook'}
          </button>
          <button
            onClick={() => router.push('/admin/playbooks')}
            className="px-6 py-3 text-xs font-semibold tracking-[0.1em] uppercase transition-colors"
            style={{ color: 'rgba(245,245,245,0.35)' }}
          >
            Cancelar
          </button>
        </div>

        {isEdit && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-5 py-3 text-xs font-semibold tracking-[0.1em] uppercase border transition-colors disabled:opacity-50"
            style={{
              borderColor: 'rgba(239,68,68,0.3)',
              color: 'rgba(239,68,68,0.7)',
            }}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        )}
      </div>
    </div>
  )
}
