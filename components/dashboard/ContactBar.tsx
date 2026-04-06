'use client'

// Número de WhatsApp de Jorge (formato internacional sin + ni espacios)
const WHATSAPP_NUMBER = '525637157252'

function buildWhatsAppLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export default function ContactBar({ clientName }: { clientName: string }) {
  const actions = [
    {
      label: 'Optimizar un flujo',
      description: 'Manda un proceso y lo hacemos más eficiente.',
      href: buildWhatsAppLink(
        `Hola Jorge, soy ${clientName}.\n\nQuiero revisar y optimizar este flujo de trabajo:\n\n[Describe el flujo aquí]`
      ),
    },
    {
      label: 'Duda sobre mi playbook',
      description: 'Pregunta sobre cómo usar o adaptar un prompt.',
      href: buildWhatsAppLink(
        `Hola Jorge, soy ${clientName}.\n\nTengo una pregunta sobre mi playbook:\n\n[Tu pregunta aquí]`
      ),
    },
    {
      label: 'Revisar automatización',
      description: 'Algo no funciona o quieres mejorarlo.',
      href: buildWhatsAppLink(
        `Hola Jorge, soy ${clientName}.\n\nQuiero revisar esta automatización:\n\n[Describe la automatización]`
      ),
    },
  ]

  return (
    <div className="pt-4">
      <p
        className="text-xs font-black tracking-[0.2em] uppercase mb-4"
        style={{ color: 'rgba(245,245,245,0.2)' }}
      >
        Accesos directos
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {actions.map(action => (
          <a
            key={action.label}
            href={action.href}
            className="group px-5 py-4 border flex flex-col gap-2 transition-all"
            style={{
              borderColor: 'rgba(255,255,255,0.07)',
              background: 'rgba(255,255,255,0.015)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(200,255,0,0.25)'
              e.currentTarget.style.background = 'rgba(200,255,0,0.03)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
              e.currentTarget.style.background = 'rgba(255,255,255,0.015)'
            }}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-black tracking-[0.08em] uppercase text-[#F5F5F5] transition-colors group-hover:text-[#C8FF00]"
                style={{ color: 'rgba(245,245,245,0.7)' }}>
                {action.label}
              </p>
              <span className="text-xs transition-all" style={{ color: 'rgba(200,255,0,0.3)' }}>→</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(245,245,245,0.3)' }}>
              {action.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  )
}
