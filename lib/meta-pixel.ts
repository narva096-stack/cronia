/**
 * Helper para disparar eventos de Meta Pixel de forma segura (evita errores en SSR).
 */
export function trackFbEvent(
  name: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  if (typeof window === 'undefined') return
  if (typeof window.fbq !== 'function') return

  if (eventId) {
    window.fbq('track', name, params ?? {}, { eventID: eventId })
  } else {
    window.fbq('track', name, params ?? {})
  }
}
