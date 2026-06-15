import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useCrisis } from '../store/crisis'
import { MigraineCrisis, TreatmentLog } from '../data/types'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { SectionTitle } from '../components/ui/Primitives'
import { intensityColor, intensitySoft } from '../tokens'
import { capitalize, longDate, MONTHS_FR, DAYS_SHORT } from '../utils/date'
import { CrisisRow } from './HomeScreen'

interface Props {
  openCrisis: (c: MigraineCrisis) => void
}

export function HistoryScreen({ openCrisis }: Props) {
  const { T, A, dark } = useTheme()
  const { crises, logs, schedules } = useCrisis()
  const now = new Date()
  const [month, setMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [selected, setSelected] = useState<number | null>(null)

  const year = month.getFullYear(), m = month.getMonth()
  const firstDow = (new Date(year, m, 1).getDay() + 6) % 7
  const daysInMonth = new Date(year, m + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) cells.push(day)

  const crisesByDay: Record<number, MigraineCrisis[]> = {}
  crises.filter(c => c.end).forEach(c => {
    if (c.start.getFullYear() === year && c.start.getMonth() === m) {
      const k = c.start.getDate()
      if (!crisesByDay[k]) crisesByDay[k] = []
      crisesByDay[k].push(c)
    }
  })

  // Logs indexed by day-of-month for this month
  const prefix = `${year}-${String(m + 1).padStart(2, '0')}`
  const logsByDay: Record<number, TreatmentLog[]> = {}
  logs.filter(l => l.date.startsWith(prefix)).forEach(l => {
    const day = parseInt(l.date.slice(8), 10)
    if (!logsByDay[day]) logsByDay[day] = []
    logsByDay[day].push(l)
  })

  const monthCrises = crises.filter(c => c.end && c.start.getFullYear() === year && c.start.getMonth() === m)
    .sort((a, b) => b.start.getTime() - a.start.getTime())
  const dayList = selected ? (crisesByDay[selected] || []) : monthCrises
  const dayLogs = selected ? (logsByDay[selected] || []).sort((a, b) => a.time.localeCompare(b.time)) : []

  function navBtn() {
    return { width: 34, height: 34, borderRadius: 10, border: 'none', background: T.cardTint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' } as const
  }

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 820, color: T.onSurface, margin: '4px 2px 18px', letterSpacing: -0.5 }}>Historique</h1>

      <Card pad={16}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <button onClick={() => { setMonth(new Date(year, m - 1, 1)); setSelected(null) }} style={navBtn()}>
            <Icon name="chevronL" size={18} color={T.onSurface} stroke={2.2} />
          </button>
          <span style={{ fontSize: 15.5, fontWeight: 750, color: T.onSurface }}>{capitalize(MONTHS_FR[m])} {year}</span>
          <button onClick={() => { setMonth(new Date(year, m + 1, 1)); setSelected(null) }} style={navBtn()}>
            <Icon name="chevronR" size={18} color={T.onSurface} stroke={2.2} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
          {DAYS_SHORT.map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: T.onSurfaceVariant }}>{d}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
          {cells.map((day, i) => {
            if (!day) return <div key={i} />
            const dc = crisesByDay[day]
            const dl = logsByDay[day]
            const isSel = selected === day
            const maxInt = dc ? Math.max(...dc.map(c => c.intensity || 0)) : 0
            const isToday = year === now.getFullYear() && m === now.getMonth() && day === now.getDate()
            const clickable = !!(dc || dl)
            return (
              <button key={i} onClick={() => setSelected(isSel ? null : (clickable ? day : null))}
                style={{
                  aspectRatio: '1', borderRadius: 11,
                  border: isToday ? `1.5px solid ${A}` : '1.5px solid transparent',
                  background: isSel ? A : dc ? intensitySoft(maxInt, dark ? 0.26 : 0.16) : 'transparent',
                  cursor: clickable ? 'pointer' : 'default',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
                  fontFamily: 'inherit', position: 'relative',
                }}>
                <span style={{ fontSize: 13, fontWeight: dc ? 750 : 500, color: isSel ? '#fff' : dc ? T.onSurface : T.onSurfaceVariant }}>{day}</span>
                <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  {dc && <span style={{ width: 5, height: 5, borderRadius: 5, background: isSel ? '#fff' : intensityColor(maxInt) }} />}
                  {dl && <span style={{ width: 5, height: 5, borderRadius: 5, background: isSel ? 'rgba(255,255,255,0.7)' : (dark ? '#6B9B6B' : '#4CAF50') }} />}
                </div>
              </button>
            )
          })}
        </div>
      </Card>

      <div style={{ marginTop: 22 }}>
        <SectionTitle>
          {selected ? capitalize(longDate(new Date(year, m, selected))) : `Crises de ${MONTHS_FR[m]}`}
        </SectionTitle>
        {dayList.length === 0 && (!selected || dayLogs.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: T.onSurfaceVariant, fontSize: 14 }}>Aucune crise ce mois-ci 🌿</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {dayList.map(c => <CrisisRow key={c.id} crisis={c} onClick={() => openCrisis(c)} />)}
          </div>
        )}

        {/* Treatment logs for selected day */}
        {selected && dayLogs.length > 0 && (
          <div style={{ marginTop: 18 }}>
            <SectionTitle>Médicaments</SectionTitle>
            <Card pad={0}>
              {dayLogs.map((log, i) => {
                const sched = schedules.find(s => s.id === log.scheduleId)
                const name = sched?.name ?? log.scheduleId
                const dose = sched?.dose ?? ''
                const isLast = i === dayLogs.length - 1
                return (
                  <div key={log.id} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 16px',
                    borderBottom: isLast ? 'none' : `1px solid ${T.cardBorder}`,
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: log.taken ? '#4CAF5018' : (dark ? '#ffffff10' : '#00000008'),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon name={log.taken ? 'check' : 'close'} size={16}
                        color={log.taken ? '#4CAF50' : T.onSurfaceVariant} stroke={2.2} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 650, color: T.onSurface }}>{name}{dose ? ` · ${dose}` : ''}</div>
                      <div style={{ fontSize: 12, color: T.onSurfaceVariant, marginTop: 1 }}>
                        {log.taken ? `Pris${log.takenAt ? ` à ${log.takenAt}` : ''}` : 'Ignoré'} · prévu {log.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
