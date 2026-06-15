import { useTheme } from '../../hooks/useTheme'

interface Props {
  data: number[]
  labels: string[]
  height?: number
}

export function BarChart({ data, labels, height = 180 }: Props) {
  const { T, A } = useTheme()
  const max = Math.max(1, ...data)
  const W = 320, H = height, padB = 26, padT = 10
  const n = data.length
  const gap = 8
  const bw = (W - gap * (n - 1)) / n
  const maxIdx = data.indexOf(Math.max(...data))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ overflow: 'visible' }}>
      {data.map((v, i) => {
        const bh = (H - padB - padT) * (v / max)
        const x = i * (bw + gap)
        const y = H - padB - bh
        const isMax = i === maxIdx && v > 0
        return (
          <g key={i}>
            <rect x={x} y={padT} width={bw} height={H - padB - padT} rx={5} fill={T.outline} opacity={0.5} />
            <rect x={x} y={y} width={bw} height={Math.max(bh, v > 0 ? 4 : 0)} rx={5}
              fill={A} opacity={isMax ? 1 : 0.45}>
              <animate attributeName="height" from="0" to={Math.max(bh, v > 0 ? 4 : 0)} dur="0.5s" fill="freeze" />
              <animate attributeName="y" from={H - padB} to={y} dur="0.5s" fill="freeze" />
            </rect>
            {v > 0 && (
              <text x={x + bw / 2} y={y - 5} textAnchor="middle"
                fontSize="11" fontWeight="700" fill={T.onSurface} fontFamily="inherit">{v}</text>
            )}
            <text x={x + bw / 2} y={H - 8} textAnchor="middle"
              fontSize="11" fill={T.onSurfaceVariant} fontFamily="inherit">{labels[i]}</text>
          </g>
        )
      })}
    </svg>
  )
}
