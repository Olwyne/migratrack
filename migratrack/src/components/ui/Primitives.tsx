import { CSSProperties, ReactNode } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { intensityColor, intensitySoft } from '../../tokens'

// ── Progress bar ──────────────────────────────────────────────
export function ProgressBar({ value, color, height = 7 }: { value: number; color?: string; height?: number }) {
  const { T, A } = useTheme()
  const c = color || A
  return (
    <div style={{ width: '100%', height, borderRadius: height, background: T.outline, overflow: 'hidden' }}>
      <div style={{ width: `${Math.min(100, value * 100)}%`, height: '100%', borderRadius: height, background: c, transition: 'width .5s ease' }} />
    </div>
  )
}

// ── Intensity badge ───────────────────────────────────────────
export function IntensityBadge({ level, size = 44 }: { level: number; size?: number }) {
  const c = intensityColor(level)
  return (
    <div style={{
      width: size, height: size, borderRadius: size * 0.32, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: intensitySoft(level, 0.18), color: c,
      fontWeight: 800, fontSize: size * 0.4, fontVariantNumeric: 'tabular-nums',
    }}>{level}</div>
  )
}

export function IntensityDot({ level, size = 9 }: { level: number; size?: number }) {
  return <span style={{ width: size, height: size, borderRadius: size, background: intensityColor(level), display: 'inline-block', flexShrink: 0 }} />
}

// ── Typography helpers ────────────────────────────────────────
export function Eyebrow({ children, style = {} }: { children: ReactNode; style?: CSSProperties }) {
  const { T } = useTheme()
  return (
    <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: T.onSurfaceVariant, ...style }}>
      {children}
    </div>
  )
}

export function SectionTitle({ children, style = {}, action }: { children: ReactNode; style?: CSSProperties; action?: ReactNode }) {
  const { T } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 2px 12px', ...style }}>
      <div style={{ fontSize: 17, fontWeight: 750, color: T.onSurface, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{children}</div>
      {action}
    </div>
  )
}

export function Divider() {
  const { T } = useTheme()
  return <div style={{ width: 1, alignSelf: 'stretch', background: T.outline }} />
}
