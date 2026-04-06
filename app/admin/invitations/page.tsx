import { createClient } from '@/lib/supabase/server'
import InvitationsClient from './InvitationsClient'
import type { Invitation } from '@/types'

export default async function InvitationsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('invitations')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)

  const invitations = (data ?? []) as Invitation[]

  return <InvitationsClient invitations={invitations} />
}
