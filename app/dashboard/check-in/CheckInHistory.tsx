import type { CheckIn } from '@/types'

export default function CheckInHistory({ checkIns }: { checkIns: CheckIn[] }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <p className="text-xs font-black tracking-[0.2em] uppercase"
          style={{ color: 'rgba(245,245,245,0.3)' }}>
          Historial
        </p>
        <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.05)' }} />
      </div>

      <div className="space-y-2">
        {checkIns.map(ci => {
          const weekLabel = new Date(ci.week_date + 'T12:00:00').toLocaleDateString('es-MX', {
            day: 'numeric', month: 'long',
          })
          const totalHours = (ci.reported_email_hours + ci.reported_meeting_hours + ci.reported_repetitive_hours).toFixed(1)

          return (
            <div
              key={ci.id}
              className="grid grid-cols-12 items-center gap-4 px-5 py-4 border"
              style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.015)' }}
            >
              {/* Semana */}
              <div className="col-span-3">
                <p className="text-xs font-semibold text-[#F5F5F5] capitalize">{weekLabel}</p>
                {ci.biggest_time_drain && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(245,245,245,0.3)' }}>
                    {ci.biggest_time_drain}
                  </p>
                )}
              </div>

              {/* Score */}
              <div className="col-span-2 text-center">
                <p
                  className="text-xl font-black"
                  style={{ color: ci.optimization_score >= 4 ? '#C8FF00' : '#F5F5F5' }}
                >
                  {ci.optimization_score}
                  <span className="text-xs font-normal" style={{ color: 'rgba(245,245,245,0.25)' }}>/5</span>
                </p>
              </div>

              {/* Control */}
              <div className="col-span-2">
                <span
                  className="text-xs font-semibold tracking-[0.08em] uppercase px-2 py-1"
                  style={{
                    background: ci.felt_control ? 'rgba(200,255,0,0.08)' : 'rgba(255,255,255,0.04)',
                    color: ci.felt_control ? '#C8FF00' : 'rgba(245,245,245,0.3)',
                  }}
                >
                  {ci.felt_control ? 'Control' : 'Sin control'}
                </span>
              </div>

              {/* Acción completada */}
              <div className="col-span-2">
                {ci.completed_main_action !== null && ci.completed_main_action !== undefined ? (
                  <span
                    className="text-xs font-semibold tracking-[0.08em] uppercase px-2 py-1"
                    style={{
                      background: ci.completed_main_action ? 'rgba(200,255,0,0.08)' : 'rgba(255,255,255,0.04)',
                      color: ci.completed_main_action ? '#C8FF00' : 'rgba(245,245,245,0.3)',
                    }}
                  >
                    {ci.completed_main_action ? 'Acción ✓' : 'Acción ✗'}
                  </span>
                ) : (
                  <span className="text-xs" style={{ color: 'rgba(245,245,245,0.15)' }}>—</span>
                )}
              </div>

              {/* Horas + goal */}
              <div className="col-span-3 text-right">
                <p className="text-xs" style={{ color: 'rgba(245,245,245,0.25)' }}>
                  {totalHours} hrs
                </p>
                {ci.next_week_goal && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(245,245,245,0.35)' }}>
                    → {ci.next_week_goal}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
