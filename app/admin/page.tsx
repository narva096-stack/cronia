import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Client } from '@/types'

export default async function AdminPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false })

  const clients = (data ?? []) as Client[]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1"
            style={{ color: 'rgba(245,245,245,0.35)' }}>
            Panel admin
          </p>
          <h1 className="text-3xl font-black tracking-wide text-[#F5F5F5] uppercase">
            Clientes
          </h1>
        </div>
        <Link
          href="/admin/invitations"
          className="px-6 py-3 text-xs font-black tracking-[0.15em] uppercase"
          style={{ background: '#C8FF00', color: '#000' }}
        >
          + Invitar cliente
        </Link>
      </div>

      {/* Tabla */}
      {clients.length === 0 ? (
        <div
          className="p-12 border text-center"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm" style={{ color: 'rgba(245,245,245,0.3)' }}>
            No hay clientes aún. Empieza enviando una invitación.
          </p>
        </div>
      ) : (
        {/* Desktop tabla */}
        <div className="hidden md:block border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div
            className="grid grid-cols-5 px-5 py-3 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}
          >
            {['Cliente', 'Correo', 'Plan', 'Estado', 'Acciones'].map(col => (
              <p key={col} className="text-xs font-black tracking-[0.12em] uppercase"
                style={{ color: 'rgba(245,245,245,0.4)' }}>
                {col}
              </p>
            ))}
          </div>
          {clients.map((client, idx) => (
            <div
              key={client.id}
              className={`grid grid-cols-5 px-5 py-4 items-center ${idx < clients.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <p className="text-sm font-semibold text-[#F5F5F5]">{client.name}</p>
              <p className="text-xs" style={{ color: 'rgba(245,245,245,0.5)' }}>{client.email}</p>
              <p className="text-xs" style={{ color: 'rgba(245,245,245,0.5)' }}>
                {client.plan_price ? `$${client.plan_price}/mes` : '—'}
              </p>
              <div>
                <span className="text-xs font-semibold tracking-[0.1em] uppercase px-2 py-1"
                  style={{
                    background: client.active ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                    color: client.active ? '#C8FF00' : 'rgba(245,245,245,0.4)',
                  }}>
                  {client.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <Link href={`/admin/clients/${client.id}`}
                className="text-xs font-semibold tracking-[0.1em] uppercase hover:text-[#C8FF00] transition-colors"
                style={{ color: 'rgba(245,245,245,0.5)' }}>
                Gestionar →
              </Link>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="md:hidden space-y-3">
          {clients.map(client => (
            <Link key={client.id} href={`/admin/clients/${client.id}`}
              className="block p-4 border"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-sm font-semibold text-[#F5F5F5]">{client.name}</p>
                <span className="text-xs font-semibold tracking-[0.1em] uppercase px-2 py-1 flex-shrink-0"
                  style={{
                    background: client.active ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                    color: client.active ? '#C8FF00' : 'rgba(245,245,245,0.4)',
                  }}>
                  {client.active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <p className="text-xs mb-1" style={{ color: 'rgba(245,245,245,0.4)' }}>{client.email}</p>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs" style={{ color: 'rgba(245,245,245,0.4)' }}>
                  {client.plan_price ? `$${client.plan_price}/mes` : '—'}
                </p>
                <span className="text-xs font-semibold" style={{ color: '#C8FF00' }}>Gestionar →</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
