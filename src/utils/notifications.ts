import { TreatmentSchedule } from '../data/types'

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

export function notificationsGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

function notify(title: string, body: string, tag: string) {
  if (!notificationsGranted()) return
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(reg => {
      reg.showNotification(title, { body, icon: '/logo.png', badge: '/logo.png', tag })
    }).catch(() => new Notification(title, { body, icon: '/logo.png', tag }))
  } else {
    new Notification(title, { body, icon: '/logo.png', tag })
  }
}

// ─── Crisis hourly reminders ─────────────────────────────────────────────────

let crisisInterval: ReturnType<typeof setInterval> | null = null

export function startCrisisReminders() {
  stopCrisisReminders()
  crisisInterval = setInterval(() => {
    notify('Comment va ta migraine ?', 'Note l\'évolution de ta crise pour suivre l\'amélioration.', 'crisis-checkin')
  }, 60 * 60 * 1000)
}

export function stopCrisisReminders() {
  if (crisisInterval) { clearInterval(crisisInterval); crisisInterval = null }
}

// ─── Treatment reminders ──────────────────────────────────────────────────────

const treatmentTimeouts: ReturnType<typeof setTimeout>[] = []

export function scheduleTreatmentReminders(schedules: TreatmentSchedule[]) {
  clearTreatmentReminders()
  const now = new Date()
  for (const s of schedules) {
    if (!s.active) continue
    for (const time of s.times) {
      const [h, m] = time.split(':').map(Number)
      const target = new Date(now)
      target.setHours(h, m, 0, 0)
      const diff = target.getTime() - now.getTime()
      if (diff > 0 && diff < 24 * 60 * 60 * 1000) {
        const t = setTimeout(() => {
          notify(`💊 ${s.name}`, `Il est l'heure de prendre ${s.dose}.`, `treatment-${s.id}-${time}`)
        }, diff)
        treatmentTimeouts.push(t)
      }
    }
  }
}

export function clearTreatmentReminders() {
  treatmentTimeouts.forEach(clearTimeout)
  treatmentTimeouts.length = 0
}
