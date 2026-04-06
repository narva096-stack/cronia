import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminClientForm from './AdminClientForm'
import type { Client, Baseline, Session, ActionItem, Insight, Playbook, CheckIn } from '@/types'

export default async function AdminClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: client } = await supabase
    .from('clients').select('*').eq('id', id).single()

  if (!client) notFound()

  const [baselineRes, sessionsRes, actionsRes, insightsRes, playbooksRes, checkInsRes] =
    await Promise.all([
      supabase.from('baselines').select('*').eq('client_id', id).single(),
      supabase.from('sessions').select('*').eq('client_id', id).order('scheduled_at', { ascending: false }).limit(10),
      supabase.from('action_items').select('*').eq('client_id', id).order('week_date', { ascending: false }).limit(20),
      supabase.from('insights').select('*').eq('client_id', id).order('week_date', { ascending: false }).limit(10),
      supabase.from('playbooks').select('*').eq('client_id', id).order('created_at', { ascending: false }),
      supabase.from('check_ins').select('*').eq('client_id', id).order('week_date', { ascending: false }).limit(8),
    ])

  return (
    <AdminClientForm
      client={client as Client}
      baseline={baselineRes.data as Baseline | null}
      sessions={(sessionsRes.data ?? []) as Session[]}
      actionItems={(actionsRes.data ?? []) as ActionItem[]}
      insights={(insightsRes.data ?? []) as Insight[]}
      playbooks={(playbooksRes.data ?? []) as Playbook[]}
      checkIns={(checkInsRes.data ?? []) as CheckIn[]}
    />
  )
}
