import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GridBackground from '@/components/ui/GridBackground'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/dashboard/home')

  return (
    <div className="relative min-h-screen bg-black">
      <GridBackground />
      <div className="relative z-10">
        {/* Admin topbar */}
        <header
          className="flex items-center justify-between px-8 py-5 border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center gap-8">
            <span className="text-base font-black tracking-[0.25em] text-[#F5F5F5] uppercase">
              CRONIA
            </span>
            <span
              className="text-xs font-semibold tracking-[0.15em] uppercase px-2 py-1"
              style={{ background: 'rgba(200,255,0,0.1)', color: '#C8FF00' }}
            >
              Admin
            </span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/admin"
              className="text-xs font-semibold tracking-[0.1em] uppercase transition-colors hover:text-[#C8FF00]"
              style={{ color: 'rgba(245,245,245,0.5)' }}>
              Clientes
            </Link>
            <Link href="/admin/playbooks"
              className="text-xs font-semibold tracking-[0.1em] uppercase transition-colors hover:text-[#C8FF00]"
              style={{ color: 'rgba(245,245,245,0.5)' }}>
              Playbooks
            </Link>
            <Link href="/admin/invitations"
              className="text-xs font-semibold tracking-[0.1em] uppercase transition-colors hover:text-[#C8FF00]"
              style={{ color: 'rgba(245,245,245,0.5)' }}>
              Invitaciones
            </Link>
            <a href="/api/logout"
              className="text-xs font-semibold tracking-[0.1em] uppercase transition-colors hover:text-[#F5F5F5]"
              style={{ color: 'rgba(245,245,245,0.3)' }}>
              Salir
            </a>
          </nav>
        </header>

        <main className="px-8 py-8 max-w-6xl mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
