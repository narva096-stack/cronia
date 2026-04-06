import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Client, Playbook } from '@/types'

export default async function AdminPlaybooksPage() {
  const supabase = await createClient()

  const [{ data: playbooks }, { data: clients }] = await Promise.all([
    supabase
      .from('playbooks')
      .select('*, clients(name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('clients')
      .select('id, name')
      .eq('active', true)
      .order('name'),
  ])

  const items = (playbooks ?? []) as (Playbook & { clients: { name: string } | null })[]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase mb-1"
            style={{ color: 'rgba(245,245,245,0.35)' }}>
            Contenido
          </p>
          <h1 className="text-3xl font-black tracking-wide text-[#F5F5F5] uppercase">
            Playbooks
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(245,245,245,0.4)' }}>
            {items.length} playbook{items.length !== 1 ? 's' : ''} creados
          </p>
        </div>
        <Link
          href="/admin/playbooks/new"
          className="px-6 py-3 text-xs font-black tracking-[0.15em] uppercase"
          style={{ background: '#C8FF00', color: '#000' }}
        >
          + Nuevo playbook
        </Link>
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="py-16 border text-center" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-sm" style={{ color: 'rgba(245,245,245,0.3)' }}>
            No hay playbooks aún.{' '}
            <Link href="/admin/playbooks/new" style={{ color: '#C8FF00' }}>Crea el primero →</Link>
          </p>
        </div>
      ) : (
        <div className="border" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          {/* Header */}
          <div
            className="grid grid-cols-12 px-5 py-3 border-b"
            style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.03)' }}
          >
            {['Título', 'Cliente', 'Categoría', 'Estado', ''].map((col, i) => (
              <p
                key={i}
                className={`text-xs font-black tracking-[0.12em] uppercase ${
                  i === 0 ? 'col-span-4' : i === 1 ? 'col-span-3' : i === 2 ? 'col-span-2' : i === 3 ? 'col-span-2' : 'col-span-1 text-right'
                }`}
                style={{ color: 'rgba(245,245,245,0.4)' }}
              >
                {col}
              </p>
            ))}
          </div>

          {items.map((p, idx) => (
            <div
              key={p.id}
              className={`grid grid-cols-12 px-5 py-4 items-center ${idx < items.length - 1 ? 'border-b' : ''}`}
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}
            >
              <div className="col-span-4">
                <p className="text-sm font-semibold text-[#F5F5F5] truncate">{p.title}</p>
                {p.objective && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(245,245,245,0.35)' }}>
                    {p.objective}
                  </p>
                )}
              </div>
              <p className="col-span-3 text-xs truncate" style={{ color: 'rgba(245,245,245,0.5)' }}>
                {p.clients?.name ?? '—'}
              </p>
              <p className="col-span-2 text-xs" style={{ color: 'rgba(245,245,245,0.5)' }}>
                {p.category}
              </p>
              <div className="col-span-2">
                <span
                  className="text-xs font-semibold tracking-[0.1em] uppercase px-2 py-1"
                  style={{
                    background: p.is_active ? 'rgba(200,255,0,0.1)' : 'rgba(255,255,255,0.05)',
                    color: p.is_active ? '#C8FF00' : 'rgba(245,245,245,0.35)',
                  }}
                >
                  {p.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="col-span-1 text-right">
                <Link
                  href={`/admin/playbooks/${p.id}`}
                  className="text-xs font-semibold tracking-[0.1em] uppercase hover:text-[#C8FF00] transition-colors"
                  style={{ color: 'rgba(245,245,245,0.4)' }}
                >
                  Editar →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
