'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Invitation } from '@/types'

export default function InvitationsClient({ invitations }: { invitations: Invitation[] }) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastLink, setLastLink] = useState('')
  const [resendingId, setResendingId] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setLastLink('')

    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    const data = await res.json()

    if (!res.ok) {
      setError(data.error ?? 'Error al crear invitación.')
    } else {
      setLastLink(data.link)
      setEmail('')
      router.refresh()
    }

    setLoading(false)
  }

  async function handleResend(invEmail: string, invId: string) {
    setResendingId(invId)
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: invEmail }),
    })
    const data = await res.json()
    if (res.ok) {
      setLastLink(data.link)
      router.refresh()
    }
    setResendingId(null)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1"
          style={{ color: 'rgba(245,245,245,0.35)' }}>
          Admin
        </p>
        <h1 className="text-3xl font-black tracking-wide text-[#F5F5F5] uppercase">
          Invitaciones
        </h1>
      </div>

      {/* Formulario */}
      <div
        className="p-6 border max-w-md"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
      >
        <p className="text-xs font-black tracking-[0.15em] uppercase mb-4"
          style={{ color: 'rgba(245,245,245,0.4)' }}>
          Crear nueva invitación
        </p>
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold tracking-[0.12em] uppercase mb-2"
              style={{ color: 'rgba(245,245,245,0.5)' }}>
              Correo del cliente
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="cliente@empresa.com"
              className="w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] placeholder:opacity-30"
              style={{ borderColor: 'rgba(255,255,255,0.12)' }}
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 text-xs font-black tracking-[0.15em] uppercase disabled:opacity-50"
            style={{ background: '#C8FF00', color: '#000' }}
          >
            {loading ? 'Creando...' : 'Crear y enviar invitación →'}
          </button>
        </form>

        {/* Link generado */}
        {lastLink && (
          <div
            className="mt-4 p-4 border"
            style={{ borderColor: 'rgba(200,255,0,0.3)', background: 'rgba(200,255,0,0.04)' }}
          >
            <p className="text-xs font-semibold mb-2" style={{ color: '#C8FF00' }}>
              Invitación creada y enviada por correo.
            </p>
            <p className="text-xs break-all mb-2" style={{ color: 'rgba(245,245,245,0.5)' }}>
              {lastLink}
            </p>
            <button
              onClick={() => navigator.clipboard.writeText(lastLink)}
              className="text-xs font-semibold text-[#C8FF00] hover:underline"
            >
              Copiar link →
            </button>
          </div>
        )}
      </div>

      {/* Listado */}
      {invitations.length > 0 && (
        <div>
          <p className="text-xs font-black tracking-[0.15em] uppercase mb-4"
            style={{ color: 'rgba(245,245,245,0.4)' }}>
            Historial
          </p>
          <div className="border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
            {invitations.map((inv, idx) => (
              <div
                key={inv.id}
                className={`flex items-center gap-4 px-5 py-4 ${idx < invitations.length - 1 ? 'border-b' : ''}`}
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <p className="flex-1 text-sm text-[#F5F5F5]">{inv.email}</p>
                <span
                  className="text-xs font-semibold tracking-[0.1em] uppercase px-2 py-1"
                  style={{
                    background: inv.used
                      ? 'rgba(255,255,255,0.05)'
                      : 'rgba(200,255,0,0.1)',
                    color: inv.used ? 'rgba(245,245,245,0.4)' : '#C8FF00',
                  }}
                >
                  {inv.used ? 'Usado' : 'Pendiente'}
                </span>
                <p className="text-xs" style={{ color: 'rgba(245,245,245,0.3)' }}>
                  {new Date(inv.created_at).toLocaleDateString('es-MX')}
                </p>
                {!inv.used && (
                  <button
                    onClick={() => handleResend(inv.email, inv.id)}
                    disabled={resendingId === inv.id}
                    className="text-xs font-semibold tracking-[0.1em] uppercase transition-colors disabled:opacity-40"
                    style={{ color: 'rgba(245,245,245,0.4)' }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#C8FF00')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,245,245,0.4)')}
                  >
                    {resendingId === inv.id ? 'Enviando...' : 'Reenviar →'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
