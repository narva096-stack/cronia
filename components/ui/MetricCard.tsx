interface MetricCardProps {
  label: string
  value: string | number
  unit?: string
  sublabel?: string
  accent?: boolean
}

export default function MetricCard({ label, value, unit, sublabel, accent }: MetricCardProps) {
  return (
    <div
      className="p-6 border flex flex-col gap-3 transition-colors hover:border-[rgba(200,255,0,0.2)]"
      style={{
        borderColor: 'rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <p
        className="text-xs font-semibold tracking-[0.15em] uppercase"
        style={{ color: 'rgba(245,245,245,0.4)' }}
      >
        {label}
      </p>
      <div className="flex items-end gap-1">
        <span
          className="text-4xl font-black leading-none"
          style={{ color: accent ? '#C8FF00' : '#F5F5F5' }}
        >
          {value}
        </span>
        {unit && (
          <span className="text-sm mb-1" style={{ color: 'rgba(245,245,245,0.4)' }}>
            {unit}
          </span>
        )}
      </div>
      {sublabel && (
        <p className="text-xs" style={{ color: 'rgba(245,245,245,0.3)' }}>
          {sublabel}
        </p>
      )}
    </div>
  )
}
