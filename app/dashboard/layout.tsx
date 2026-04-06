import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/dashboard/Sidebar'
import GridBackground from '@/components/ui/GridBackground'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, role')
    .eq('id', user.id)
    .single()

  // Admins van a su panel
  if (profile?.role === 'admin') redirect('/admin')

  const clientName = profile?.name ?? user.email ?? 'Cliente'

  return (
    <div className="relative min-h-screen bg-black">
      <GridBackground />
      <Sidebar clientName={clientName} />
      <main className="relative z-10 ml-56 min-h-screen px-12 py-10" style={{ maxWidth: 'calc(100% - 224px)' }}>
        {children}
      </main>
    </div>
  )
}
