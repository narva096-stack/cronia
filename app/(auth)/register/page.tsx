'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GridBackground from '@/components/ui/GridBackground'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Link de invitación inválido.')
      setValidating(false)
      return
    }

    // Validar token
    fetch(`/api/invitations?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setError(data.error)
        } else {
          setEmail(data.email)
        }
        setValidating(false)
      })
      .catch(() => {
        setError('Error al validar tu invitación.')
        setValidating(false)
      })
  }, [token])

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, role: 'client' },
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    // Marcar invitación como usada
    await fetch('/api/invitations', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    router.push('/dashboard/home')
  }

  if (validating) {
    return (
      <div className="text-center">
        <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(245,245,245,0.4)' }}>
          Validando invitación...
        </p>
      </div>
    )
  }

  return (
    <div className="relative z-10 w-full max-w-sm px-6">
      {/* Logo */}
      <div className="mb-12 text-center">
        <span className="text-2xl font-black tracking-[0.3em] text-[#F5F5F5] uppercase">
          CRONIA
        </span>
        <div className="mt-2 h-px w-8 bg-[#C8FF00] mx-auto" />
      </div>

      <div
        className="border p-8"
        style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
      >
        <h1 className="text-sm font-black tracking-[0.2em] uppercase text-[#F5F5F5] mb-1">
          Crea tu cuenta
        </h1>
        <p className="text-xs mb-8" style={{ color: 'rgba(245,245,245,0.4)' }}>
          {email ? `Invitación para ${email}` : 'Completa tu registro.'}
        </p>

        {error && !email ? (
          <div className="py-3 px-4 border border-red-500/30 bg-red-500/10">
            <p className="text-xs text-red-400">{error}</p>
            <a href="mailto:hola@cronia.mx" className="text-xs text-[#C8FF00] mt-2 block">
              Contacta a Jorge →
            </a>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: 'rgba(245,245,245,0.5)' }}>
                Tu nombre
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="Nombre completo"
                className="w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] transition-colors placeholder:opacity-30"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: 'rgba(245,245,245,0.5)' }}>
                Correo
              </label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full bg-transparent border px-4 py-3 text-sm opacity-50 cursor-not-allowed"
                style={{ borderColor: 'rgba(255,255,255,0.08)', color: '#F5F5F5' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: 'rgba(245,245,245,0.5)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="Mínimo 8 caracteres"
                className="w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] transition-colors placeholder:opacity-30"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: 'rgba(245,245,245,0.5)' }}>
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none focus:border-[#C8FF00] transition-colors"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}
              />
            </div>

            {error && (
              <p className="text-xs py-2 px-3 border border-red-500/30 bg-red-500/10 text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 font-black text-xs tracking-[0.2em] uppercase transition-opacity disabled:opacity-50"
              style={{ background: '#C8FF00', color: '#000' }}
            >
              {loading ? 'Creando cuenta...' : 'Crear mi cuenta →'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <GridBackground />
      <Suspense fallback={<div />}>
        <RegisterForm />
      </Suspense>
    </div>
  )
}
