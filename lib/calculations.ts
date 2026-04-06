import type { Baseline, CheckIn, WeeklyMetrics } from '@/types'

/**
 * Calcula horas recuperadas en una semana específica
 * comparando el baseline del cliente vs lo que reportó en su check-in.
 */
export function calcHoursRecovered(baseline: Baseline, checkIn: CheckIn): number {
  const baselineWeekly =
    baseline.weekly_email_hours +
    baseline.weekly_meeting_hours +
    baseline.weekly_repetitive_hours

  const currentWeekly =
    checkIn.reported_email_hours +
    checkIn.reported_meeting_hours +
    checkIn.reported_repetitive_hours

  return Math.max(0, baselineWeekly - currentWeekly)
}

/**
 * Calcula el total acumulado de horas recuperadas
 * a lo largo de todos los check-ins del cliente.
 */
export function calcTotalHoursRecovered(baseline: Baseline, checkIns: CheckIn[]): number {
  return checkIns.reduce((total, ci) => total + calcHoursRecovered(baseline, ci), 0)
}

/**
 * Calcula el porcentaje de reducción operativa promedio.
 * Basado en cuánto bajó el tiempo reportado vs el baseline.
 */
export function calcOperationalReduction(baseline: Baseline, checkIns: CheckIn[]): number {
  if (!checkIns.length || !baseline.total_hours) return 0

  const avgReported =
    checkIns.reduce((sum, ci) => {
      return (
        sum +
        ci.reported_email_hours +
        ci.reported_meeting_hours +
        ci.reported_repetitive_hours
      )
    }, 0) / checkIns.length

  const baselinePartial =
    baseline.weekly_email_hours +
    baseline.weekly_meeting_hours +
    baseline.weekly_repetitive_hours

  if (!baselinePartial) return 0
  return Math.min(100, Math.round(((baselinePartial - avgReported) / baselinePartial) * 100))
}

/**
 * Calcula el score de control promedio (1–5) de todos los check-ins.
 */
export function calcControlScore(checkIns: CheckIn[]): number {
  if (!checkIns.length) return 0
  const avg =
    checkIns.reduce((sum, ci) => sum + ci.optimization_score, 0) / checkIns.length
  return Math.round(avg * 10) / 10
}

/**
 * Genera las métricas completas para el Home.
 */
export function calcWeeklyMetrics(
  baseline: Baseline | null,
  checkIns: CheckIn[]
): WeeklyMetrics {
  if (!baseline || !checkIns.length) {
    return {
      hoursRecovered: 0,
      operationalReduction: 0,
      controlScore: 0,
      totalCheckIns: checkIns.length,
      baselineTotal: baseline?.total_hours ?? 0,
    }
  }

  return {
    hoursRecovered: calcTotalHoursRecovered(baseline, checkIns),
    operationalReduction: calcOperationalReduction(baseline, checkIns),
    controlScore: calcControlScore(checkIns),
    totalCheckIns: checkIns.length,
    baselineTotal: baseline.total_hours,
  }
}

/**
 * Devuelve la fecha del lunes de la semana actual.
 */
export function getCurrentWeekMonday(): string {
  const today = new Date()
  const day = today.getDay()
  const diff = today.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  return monday.toISOString().split('T')[0]
}

/**
 * Formatea una fecha ISO a texto legible en español.
 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
