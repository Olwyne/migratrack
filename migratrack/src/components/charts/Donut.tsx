import { useTheme } from '../../hooks/useTheme'

interface Segment { label: string; value: number; color: string }
interface Props {
  segments: Segment[]
  size?: number
  thickness?: number
  centerLabel?: number | string
  centerSub?: string
}

function polar(cx: number, cy: number, r: number, ang: number): [number, number] {
  const a = (ang - 90) * Math.PI / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}

function arc(cx: number, cy: number, r: number, a0: number, a1: number) {
  const [x0, y0] = polar(cx, cy, r, a0), [x1, y1] = polar(cx, cy, r, a1)
  const large = a1 - a0 > 180 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`
}

export function Donut({ segments, size = 168, thickness = 26, centerLabel, centerSub }: Props) {
  const { T } = useTheme()
  const cx = size / 2, cy = size / 2, r = (size - thickness) / 2
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  let acc = 0

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={T.outline} strokeWidth={thickness} opacity={0.4} />
      {segments.map((s, i) => {
        const a0 = (acc / total) * 360
        acc += s.value
        const a1 = (acc / total) * 360
        const path = arc(cx, cy, r, a0, Math.max(a0 + 0.6, a1 - 1.5))
        return <path key={i} d={path} fill="none" stroke={s.color} strokeWidth={thickness} strokeLinecap="round" />
      })}
      {centerLabel != null && (
        <text x={cx} y={cy - 2} textAnchor="middle" fontSize="26" fontWeight="800" fill={T.onSurface} fontFamily="inherit">{centerLabel}</text>
      )}
      {centerSub && (
        <text x={cx} y={cy + 17} textAnchor="middle" fontSize="11.5" fill={T.onSurfaceVariant} fontFamily="inherit">{centerSub}</text>
      )}
    </svg>
  )
}
