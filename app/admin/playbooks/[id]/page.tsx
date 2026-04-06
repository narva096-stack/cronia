import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PlaybookForm from '../PlaybookForm'
import type { Client, Playbook } from '@/types'

export default async function EditPlaybookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: playbook }, { data: clients }] = await Promise.all([
    supabase.from('playbooks').select('*').eq('id', id).single(),
    supabase.from('clients').select('id, name').eq('active', true).order('name'),
  ])

  if (!playbook) notFound()

  return (
    <div className="space-y-8">
      <div>
        <Link
          href="/admin/playbooks"
          className="text-xs mb-4 block transition-colors hover:text-[#F5F5F5]"
          style={{ color: 'rgba(245,245,245,0.4)' }}
        >
          ← Todos los playbooks
        </Link>
        <h1 className="text-3xl font-black tracking-wide text-[#F5F5F5] uppercase">
          Editar playbook
        </h1>
        <p className="text-sm mt-1" style={{ color: 'rgba(245,245,245,0.4)' }}>
          {playbook.title}
        </p>
      </div>
      <PlaybookForm
        clients={(clients ?? []) as Pick<Client, 'id' | 'name'>[]}
        playbook={playbook as Playbook}
      />
    </div>
  )
}
