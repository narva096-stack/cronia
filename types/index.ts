export type Role = 'admin' | 'client'

export interface Profile {
  id: string
  email: string
  name: string | null
  role: Role
  created_at: string
}

export interface Client {
  id: string
  user_id: string
  name: string
  email: string
  plan_price: number | null
  internal_notes: string | null
  active: boolean
  created_at: string
}

export interface Baseline {
  id: string
  client_id: string
  weekly_email_hours: number
  weekly_meeting_hours: number
  weekly_repetitive_hours: number
  weekly_research_hours: number
  weekly_content_hours: number
  total_hours: number
  created_at: string
}

export interface CheckIn {
  id: string
  client_id: string
  week_date: string
  optimization_score: number
  biggest_time_drain: string | null
  felt_control: boolean
  reported_email_hours: number
  reported_meeting_hours: number
  reported_repetitive_hours: number
  completed_main_action: boolean | null
  next_week_goal: string | null
  created_at: string
}

export interface Session {
  id: string
  client_id: string
  scheduled_at: string
  notes: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
}

export interface ActionItem {
  id: string
  client_id: string
  week_date: string
  day: 'lun' | 'mar' | 'mie' | 'jue' | 'vie'
  title: string
  description: string | null
  estimated_minutes: number | null
  prompt_link: string | null
  completed: boolean
  created_at: string
}

export interface Insight {
  id: string
  client_id: string
  week_date: string
  content: string
  created_at: string
}

export interface Playbook {
  id: string
  client_id: string
  title: string
  category: string
  objective: string | null
  description: string | null
  prompt_content: string
  when_to_use: string | null
  is_active: boolean
  created_at: string
}

export interface Invitation {
  id: string
  email: string
  token: string
  used: boolean
  created_at: string
  expires_at: string
}

// Datos calculados para el Home
export interface WeeklyMetrics {
  hoursRecovered: number
  operationalReduction: number // porcentaje
  controlScore: number // promedio de optimization_score
  totalCheckIns: number
  baselineTotal: number
}
