'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { ActionItem } from '@/types'

export default function ActionRow({ action }: { action: ActionItem }) {
  const [completed, setCompleted] = useState(action.completed)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggleComplete() {
    if (loading) return
    setLoading(true)
    const newValue = !completed
    setCompleted(newValue) // optimistic

    const supabase = createClient()
    await supabase
      .from('action_items')
      .update({ completed: newValue })
      .eq('id', action.id)

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex items-start gap-3">
      {/* Toggle button */}
      <button
        onClick={toggleComplete}
        disabled={loading}
        className="mt-0.5 flex-shrink-0 w-4 h-4 border transition-all"
        style={{
          borderColor: completed ? '#C8FF00' : 'rgba(255,255,255,0.2)',
          background: completed ? '#C8FF00' : 'transparent',
          cursor: loading ? 'wait' : 'pointer',
        }}
        title={completed ? 'Marcar como pendiente' : 'Marcar como completado'}
      >
        {completed && (
          <svg viewBox="0 0 10 8" fill="none" style={{ width: '100%', height: '100%', padding: '2px' }}>
            <path d="M1 4L3.5 6.5L9 1" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-semibold transition-all"
          style={{
            color: completed ? 'rgba(245,245,245,0.35)' : '#F5F5F5',
            textDecoration: completed ? 'line-through' : 'none',
          }}
        >
          {action.title}
        </p>
        {action.description && (
          <p className="text-xs mt-0.5" style={{ color: 'rgba(245,245,245,0.35)' }}>
            {action.description}
          </p>
        )}
        <div className="flex items-center gap-4 mt-1">
          {action.estimated_minutes && (
            <span className="text-xs" style={{ color: 'rgba(245,245,245,0.25)' }}>
              ~{action.estimated_minutes} min
            </span>
          )}
          {action.prompt_link && (
            <a
              href={action.prompt_link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold hover:underline"
              style={{ color: completed ? 'rgba(200,255,0,0.4)' : '#C8FF00' }}
            >
              Ver prompt →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
