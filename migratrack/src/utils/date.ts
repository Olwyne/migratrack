export const MONTHS_FR = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
export const DAYS_FR = ['lundi','mardi','mercredi','jeudi','vendredi','samedi','dimanche']
export const DAYS_SHORT = ['L','M','M','J','V','S','D']

export function pad(n: number) { return n.toString().padStart(2, '0') }

export function hhmm(dt: Date) { return `${pad(dt.getHours())}:${pad(dt.getMinutes())}` }

export function fmtDur(mins: number | null) {
  if (mins == null) return '—'
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h ${pad(m)}` : `${m} min`
}

export function relDate(dt: Date, now = new Date()) {
  const today = new Date(now); today.setHours(0,0,0,0)
  const day = new Date(dt); day.setHours(0,0,0,0)
  const diff = Math.round((today.getTime() - day.getTime()) / 86400000)
  if (diff === 0) return `Aujourd'hui ${hhmm(dt)}`
  if (diff === 1) return `Hier ${hhmm(dt)}`
  if (diff < 7) return `${DAYS_FR[(dt.getDay() + 6) % 7]} ${hhmm(dt)}`
  return `${dt.getDate()} ${MONTHS_FR[dt.getMonth()]}`
}

export function longDate(dt: Date) {
  return `${DAYS_FR[(dt.getDay() + 6) % 7]} ${dt.getDate()} ${MONTHS_FR[dt.getMonth()]}`
}

export function capitalize(s: string) { return s.charAt(0).toUpperCase() + s.slice(1) }
