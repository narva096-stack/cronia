import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlaybookCard from '@/components/ui/PlaybookCard'
import ContactBar from '@/components/dashboard/ContactBar'
import type { Playbook } from '@/types'

export default async function PlaybooksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: client } = await supabase
    .from('clients').select('id').eq('user_id', user.id).single()

  const { data: profile } = await supabase
    .from('profiles').select('name').eq('id', user.id).single()

  if (!client) return null

  const { data } = await supabase
    .from('playbooks')
    .select('*')
    .eq('client_id', client.id)
    .eq('is_active', true)
    .order('category', { ascending: true })

  const playbooks = (data ?? []) as Playbook[]
  const categories = [...new Set(playbooks.map(p => p.category))]

  return (
    <div className="space-y-10 max-w-3xl">

      {/* ── Header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-[#F5F5F5] uppercase leading-none">
            Playbooks.
          </h1>
          <p className="text-sm mt-2" style={{ color: 'rgba(245,245,245,0.4)' }}>
            {playbooks.length > 0
              ? `${playbooks.length} prompt${playbooks.length !== 1 ? 's' : ''} personalizados para ti.`
              : 'Tus prompts personalizados aparecerán aquí.'}
          </p>
        </div>
      </div>

      {/* ── Empty state ── */}
      {playbooks.length === 0 && (
        <div
          className="py-16 border text-center"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <p className="text-sm" style={{ color: 'rgba(245,245,245,0.25)' }}>
            Después de tu primera sesión, Jorge subirá aquí tus prompts.
          </p>
        </div>
      )}

      {/* ── Categorías ── */}
      {categories.map(category => {
        const items = playbooks.filter(p => p.category === category)
        return (
          <div key={category} className="space-y-3">
            {/* Category header */}
            <div className="flex items-center gap-4">
              <p className="text-xs font-black tracking-[0.2em] uppercase"
                style={{ color: '#C8FF00' }}>
                {category}
              </p>
              <span className="text-xs" style={{ color: 'rgba(245,245,245,0.2)' }}>
                {items.length} {items.length === 1 ? 'prompt' : 'prompts'}
              </span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.06)' }} />
            </div>

            {/* Cards */}
            <div className="space-y-2">
              {items.map(playbook => (
                <PlaybookCard key={playbook.id} playbook={playbook} />
              ))}
            </div>
          </div>
        )
      })}

      <ContactBar clientName={profile?.name ?? ''} />
    </div>
  )
}
