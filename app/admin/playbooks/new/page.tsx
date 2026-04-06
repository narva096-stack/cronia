import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PlaybookForm from '../PlaybookForm'
import type { Client } from '@/types'

export default async function NewPlaybookPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('clients')
    .select('id, name')
    .eq('active', true)
    .order('name')

  const clients = (data ?? []) as Pick<Client, 'id' | 'name'>[]

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
          Nuevo playbook
        </h1>
      </div>
      <PlaybookForm clients={clients} />
    </div>
  )
}
