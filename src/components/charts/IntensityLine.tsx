import { useTheme } from '../../hooks/useTheme'
import { intensityColor } from '../../tokens'
import { IntensityEntry, TreatmentEntry } from '../../data/types'
import { hhmm } from '../../utils/date'

interface Props {
  history: IntensityEntry[]
  treatments?: TreatmentEntry[]
  start: Date
  end: Date | null
  height?: number
}

export function IntensityLine({ history, treatments = [], start, end, height = 190 }: Props) {
  const { T, A, dark } = useTheme()
  const W = 320, H = height, padL = 26, padR = 12, padT = 14, padB = 26
  const s = start.getTime()
  const e = (end || new Date()).getTime()
  const range = Math.max(1, e - s)

  const pts = history.map(h => ({
    x: padL + (W - padL - padR) * ((h.t.getTime() - s) / range),
    y: padT + (H - padT - padB) * (1 - (h.v - 1) / 9),
    v: h.v, t: h.t,
  }))

  let path = ''
  pts.forEach((p, i) => {
    if (i === 0) { path += `M ${p.x} ${p.y}`; return }
    const prev = pts[i - 1]
    const cx = (prev.x + p.x) / 2
    path += ` C ${cx} ${prev.y} ${cx} ${p.y} ${p.x} ${p.y}`
  })
  const areaPath = pts.length ? path + ` L ${pts[pts.length - 1].x} ${H - padB} L ${pts[0].x} ${H - padB} Z` : ''
  const gridY = [1, 4, 7, 10]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <defs>
        <linearGradient id="intFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={A} stopOpacity={dark ? 0.32 : 0.22} />
          <stop offset="100%" stopColor={A} stopOpacity="0" />
        </linearGradient>
      </defs>
      {gridY.map(g => {
        const y = padT + (H - padT - padB) * (1 - (g - 1) / 9)
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke={T.outline} strokeWidth="1" strokeDasharray="2 4" opacity={0.7} />
            <text x={padL - 6} y={y + 3.5} textAnchor="end" fontSize="9.5" fill={T.onSurfaceVariant} fontFamily="inherit">{g}</text>
          </g>
        )
      })}
      {treatments.filter(t => t.takenAt).map((t, i) => {
        const x = padL + (W - padL - padR) * ((t.takenAt!.getTime() - s) / range)
        if (x < padL || x > W - padR) return null
        return (
          <g key={i}>
            <line x1={x} y1={padT} x2={x} y2={H - padB} stroke={A} strokeWidth="1.3" strokeDasharray="3 3" opacity={0.45} />
            <circle cx={x} cy={padT} r="3.5" fill={A} opacity={0.7} />
          </g>
        )
      })}
      {areaPath && <path d={areaPath} fill="url(#intFill)" />}
      {path && <path d={path} fill="none" stroke={A} strokeWidth="2.5" strokeLinecap="round" />}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="4.5" fill={intensityColor(p.v)} stroke={T.card} strokeWidth="2" />
      ))}
      {pts.length > 0 && (
        <>
          <text x={padL} y={H - 8} textAnchor="start" fontSize="9.5" fill={T.onSurfaceVariant} fontFamily="inherit">{hhmm(start)}</text>
          <text x={W - padR} y={H - 8} textAnchor="end" fontSize="9.5" fill={T.onSurfaceVariant} fontFamily="inherit">{hhmm(end || new Date())}</text>
        </>
      )}
    </svg>
  )
}
