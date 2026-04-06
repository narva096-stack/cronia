'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import clsx from 'clsx'

const nav = [
  { href: '/dashboard/home', label: 'Home' },
  { href: '/dashboard/my-week', label: 'Mi semana' },
  { href: '/dashboard/playbooks', label: 'Playbooks' },
  { href: '/dashboard/check-in', label: 'Check-in' },
]

export default function Sidebar({ clientName }: { clientName: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className="hidden md:flex fixed left-0 top-0 h-full w-56 flex-col border-r z-20"
        style={{
          borderColor: 'rgba(255,255,255,0.06)',
          background: 'rgba(0,0,0,0.95)',
        }}
      >
        {/* Logo */}
        <div className="px-6 py-8 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <Link href="/dashboard/home" className="block hover:opacity-80 transition-opacity">
            <span className="text-base font-black tracking-[0.25em] text-[#F5F5F5] uppercase">
              CRONIA
            </span>
            <div className="mt-1 h-px w-6 bg-[#C8FF00]" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-8 flex flex-col gap-1">
          {nav.map(item => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  'flex items-center gap-3 px-4 py-3.5 text-xs font-semibold tracking-[0.12em] uppercase transition-all',
                  active
                    ? 'text-[#C8FF00] bg-[rgba(200,255,0,0.05)]'
                    : 'text-[rgba(245,245,245,0.35)] hover:text-[#F5F5F5] hover:bg-[rgba(255,255,255,0.03)]'
                )}
              >
                <span className={clsx(
                  'w-1 h-1 rounded-full flex-shrink-0',
                  active ? 'bg-[#C8FF00]' : 'bg-[rgba(245,245,245,0.2)]'
                )} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-6 border-t space-y-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: 'rgba(245,245,245,0.35)' }}>
            {clientName}
          </p>
          <button
            onClick={handleLogout}
            className="text-xs font-semibold tracking-[0.1em] uppercase transition-colors"
            style={{ color: 'rgba(245,245,245,0.3)' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#F5F5F5')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(245,245,245,0.3)')}
          >
            Salir
          </button>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-5 py-4 border-b"
        style={{ background: 'rgba(0,0,0,0.97)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <Link href="/dashboard/home">
          <span className="text-sm font-black tracking-[0.25em] text-[#F5F5F5] uppercase">CRONIA</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-xs font-semibold tracking-[0.1em] uppercase"
          style={{ color: 'rgba(245,245,245,0.4)' }}
        >
          Salir
        </button>
      </div>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-20 flex border-t"
        style={{ background: 'rgba(0,0,0,0.97)', borderColor: 'rgba(255,255,255,0.08)' }}
      >
        {nav.map(item => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center py-3 gap-1"
            >
              <span
                className={clsx(
                  'text-[10px] font-black tracking-[0.08em] uppercase text-center',
                  active ? 'text-[#C8FF00]' : 'text-[rgba(245,245,245,0.3)]'
                )}
              >
                {item.label}
              </span>
              {active && <span className="w-1 h-1 rounded-full bg-[#C8FF00]" />}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
