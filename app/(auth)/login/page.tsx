'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import GridBackground from '@/components/ui/GridBackground'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Correo o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // Verificar si es admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (profile?.role === 'admin') {
      router.push('/admin')
    } else {
      router.push('/dashboard/home')
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <GridBackground />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="mb-12 text-center">
          <span
            className="text-2xl font-black tracking-[0.3em] text-[#F5F5F5] uppercase"
            style={{ fontFamily: 'var(--font-montserrat)' }}
          >
            CRONIA
          </span>
          <div className="mt-2 h-px w-8 bg-[#C8FF00] mx-auto" />
        </div>

        {/* Card */}
        <div
          className="border p-8"
          style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
        >
          <h1 className="text-sm font-black tracking-[0.2em] uppercase text-[#F5F5F5] mb-1">
            Acceso privado
          </h1>
          <p className="text-xs mb-8" style={{ color: 'rgba(245,245,245,0.4)' }}>
            Solo clientes autorizados.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase mb-2"
                style={{ color: 'rgba(245,245,245,0.5)' }}>
                Correo
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none transition-colors focus:border-[#C8FF00]"
                style={{ borderColor: 'rgba(255,255,255,0.12)' }}
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
                autoComplete="current-password"
                className="w-full bg-transparent border px-4 py-3 text-sm text-[#F5F5F5] outline-none transition-colors focus:border-[#C8FF00]"
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
              {loading ? 'Entrando...' : 'Entrar →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'rgba(245,245,245,0.25)' }}>
          ¿No tienes acceso?{' '}
          <a href="mailto:hola@cronia.mx" className="text-[#C8FF00] hover:underline">
            Contáctanos
          </a>
        </p>
      </div>
    </div>
  )
}
