import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useCrisis } from '../store/crisis'
import { MigraineCrisis } from '../data/types'
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
  const { crises } = useCrisis()
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

  const monthCrises = crises.filter(c => c.end && c.start.getFullYear() === year && c.start.getMonth() === m)
    .sort((a, b) => b.start.getTime() - a.start.getTime())
  const dayList = selected ? (crisesByDay[selected] || []) : monthCrises

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
            const isSel = selected === day
            const maxInt = dc ? Math.max(...dc.map(c => c.intensity || 0)) : 0
            const isToday = year === now.getFullYear() && m === now.getMonth() && day === now.getDate()
            return (
              <button key={i} onClick={() => setSelected(isSel ? null : (dc ? day : null))}
                style={{
                  aspectRatio: '1', borderRadius: 11,
                  border: isToday ? `1.5px solid ${A}` : '1.5px solid transparent',
                  background: isSel ? A : dc ? intensitySoft(maxInt, dark ? 0.26 : 0.16) : 'transparent',
                  cursor: dc ? 'pointer' : 'default',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
                  fontFamily: 'inherit', position: 'relative',
                }}>
                <span style={{ fontSize: 13, fontWeight: dc ? 750 : 500, color: isSel ? '#fff' : dc ? T.onSurface : T.onSurfaceVariant }}>{day}</span>
                {dc && <span style={{ width: 5, height: 5, borderRadius: 5, background: isSel ? '#fff' : intensityColor(maxInt) }} />}
              </button>
            )
          })}
        </div>
      </Card>

      <div style={{ marginTop: 22 }}>
        <SectionTitle>
          {selected ? capitalize(longDate(new Date(year, m, selected))) : `Crises de ${MONTHS_FR[m]}`}
        </SectionTitle>
        {dayList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: T.onSurfaceVariant, fontSize: 14 }}>Aucune crise ce mois-ci 🌿</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {dayList.map(c => <CrisisRow key={c.id} crisis={c} onClick={() => openCrisis(c)} />)}
          </div>
        )}
      </div>
    </div>
  )
}
