import { useTheme } from '../../hooks/useTheme'

interface Props {
  selected: string[]
  onChange: (locs: string[]) => void
}

type RectSp = { x: number; y: number; width: number; height: number }
type EllipseSp = { cx: number; cy: number; rx: number; ry: number }

interface Zone {
  id: string
  short: string
  lx: number
  ly: number
  shape: 'rect' | 'ellipse'
  sp: RectSp | EllipseSp
}

const FRONT_ZONES: Zone[] = [
  { id: 'Vertex',       short: 'Vertex',   lx: 100, ly: 26,  shape: 'ellipse', sp: { cx: 100, cy: 24, rx: 52, ry: 20 } },
  { id: 'Front',        short: 'Front',    lx: 100, ly: 62,  shape: 'rect',    sp: { x: 44, y: 42, width: 112, height: 40 } },
  { id: 'Tempe droite', short: 'Tempe D',  lx: 36,  ly: 82,  shape: 'rect',    sp: { x: 17, y: 46, width: 40, height: 72 } },
  { id: 'Tempe gauche', short: 'Tempe G',  lx: 164, ly: 82,  shape: 'rect',    sp: { x: 143, y: 46, width: 40, height: 72 } },
  { id: 'Œil droit',   short: 'Œil D',    lx: 78,  ly: 120, shape: 'ellipse', sp: { cx: 78, cy: 112, rx: 22, ry: 14 } },
  { id: 'Œil gauche',  short: 'Œil G',    lx: 122, ly: 120, shape: 'ellipse', sp: { cx: 122, cy: 112, rx: 22, ry: 14 } },
]

const BACK_ZONES: Zone[] = [
  { id: 'Occiput', short: 'Occiput', lx: 100, ly: 78,  shape: 'ellipse', sp: { cx: 100, cy: 76, rx: 62, ry: 58 } },
  { id: 'Nuque',   short: 'Nuque',   lx: 100, ly: 166, shape: 'rect',    sp: { x: 46, y: 152, width: 108, height: 30 } },
]

function ZoneShape({ z, fill, stroke, strokeWidth }: { z: Zone; fill: string; stroke: string; strokeWidth: number }) {
  if (z.shape === 'ellipse') {
    const p = z.sp as EllipseSp
    return <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  }
  const p = z.sp as RectSp
  return <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
}

interface HeadSVGProps {
  clipId: string
  zones: Zone[]
  selected: string[]
  onToggle: (id: string) => void
  deco: string
  A: string
  dark: boolean
  isAll: boolean
  children?: React.ReactNode
}

function HeadSVG({ clipId, zones, selected, onToggle, deco, A, dark, isAll, children }: HeadSVGProps) {
  return (
    <svg viewBox="0 0 200 210" style={{ width: '100%', display: 'block', userSelect: 'none', touchAction: 'manipulation' }}>
      <defs>
        <clipPath id={clipId}>
          <ellipse cx="100" cy="98" rx="73" ry="83" />
        </clipPath>
      </defs>

      <ellipse cx="100" cy="98" rx="73" ry="83"
        fill={dark ? '#1a1825' : '#F6F4FB'}
        stroke={isAll ? A : deco}
        strokeWidth={isAll ? 2.5 : 1.5}
      />

      <g clipPath={`url(#${clipId})`}>
        {zones.map(z => {
          const sel = isAll || selected.includes(z.id)
          return (
            <g key={z.id} onClick={() => onToggle(z.id)} style={{ cursor: 'pointer' }}>
              <ZoneShape
                z={z}
                fill={sel ? A : (dark ? '#ffffff06' : '#00000004')}
                stroke={sel ? A : (dark ? '#ffffff14' : '#00000012')}
                strokeWidth={sel ? 1.5 : 0.5}
              />
              <text
                x={z.lx} y={z.ly}
                textAnchor="middle" dominantBaseline="middle"
                fontSize="6.5" fontWeight="700" fontFamily="system-ui,sans-serif"
                fill={sel ? A : (dark ? '#55507a' : '#b8b2d0')}
                style={{ pointerEvents: 'none' }}
              >{z.short}</text>
            </g>
          )
        })}
      </g>

      {children}
    </svg>
  )
}

export function HeadDiagram({ selected, onChange }: Props) {
  const { T, A, dark } = useTheme()

  const toggle = (id: string) => {
    if (id === 'Crâne entier') {
      onChange(selected.includes('Crâne entier') ? [] : ['Crâne entier'])
      return
    }
    const cur = selected.filter(s => s !== 'Crâne entier')
    onChange(cur.includes(id) ? cur.filter(s => s !== id) : [...cur, id])
  }

  const isAll = selected.includes('Crâne entier')
  const deco = dark ? '#3a3650' : '#C8C3E0'

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        {/* Front view */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <HeadSVG clipId="hd-front" zones={FRONT_ZONES} selected={selected} onToggle={toggle} deco={deco} A={A} dark={dark} isAll={isAll}>
            {/* Ears */}
            <path d="M27 86 Q15 98 27 114" fill="none" stroke={deco} strokeWidth="1.4" strokeLinecap="round" />
            <path d="M173 86 Q185 98 173 114" fill="none" stroke={deco} strokeWidth="1.4" strokeLinecap="round" />
            {/* Eyebrows */}
            <path d="M62 98 Q78 92 94 98" fill="none" stroke={deco} strokeWidth="1.5" strokeLinecap="round" />
            <path d="M106 98 Q122 92 138 98" fill="none" stroke={deco} strokeWidth="1.5" strokeLinecap="round" />
            {/* Eyes */}
            <ellipse cx="78" cy="110" rx="11" ry="7" fill="none" stroke={deco} strokeWidth="1.2" />
            <ellipse cx="122" cy="110" rx="11" ry="7" fill="none" stroke={deco} strokeWidth="1.2" />
            {/* Nose */}
            <path d="M96 124 Q100 133 104 124" fill="none" stroke={deco} strokeWidth="1.2" strokeLinecap="round" />
            {/* Mouth */}
            <path d="M88 148 Q100 156 112 148" fill="none" stroke={deco} strokeWidth="1.2" strokeLinecap="round" />
          </HeadSVG>
          <p style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 600, color: T.onSurfaceVariant, margin: '2px 0 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Avant</p>
        </div>

        {/* Back view */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <HeadSVG clipId="hd-back" zones={BACK_ZONES} selected={selected} onToggle={toggle} deco={deco} A={A} dark={dark} isAll={isAll}>
            {/* Ears (mirror for back view) */}
            <path d="M27 86 Q15 98 27 114" fill="none" stroke={deco} strokeWidth="1.4" strokeLinecap="round" />
            <path d="M173 86 Q185 98 173 114" fill="none" stroke={deco} strokeWidth="1.4" strokeLinecap="round" />
            {/* Hairline */}
            <path d="M38 62 Q100 32 162 62" fill="none" stroke={deco} strokeWidth="1.3" strokeLinecap="round" />
            {/* Subtle center line */}
            <path d="M100 32 L100 148" fill="none" stroke={deco} strokeWidth="0.5" strokeDasharray="3 4" />
            {/* Neck hint */}
            <path d="M80 178 Q100 188 120 178" fill="none" stroke={deco} strokeWidth="1.2" strokeLinecap="round" />
          </HeadSVG>
          <p style={{ textAlign: 'center', fontSize: 10.5, fontWeight: 600, color: T.onSurfaceVariant, margin: '2px 0 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Arrière</p>
        </div>
      </div>

      {/* Crâne entier chip */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
        <button
          onClick={() => toggle('Crâne entier')}
          style={{
            padding: '5px 14px', borderRadius: 20, cursor: 'pointer', fontFamily: 'inherit',
            fontSize: 12.5, fontWeight: 600, transition: 'all 0.15s',
            background: isAll ? A : 'transparent',
            color: isAll ? '#fff' : T.onSurfaceVariant,
            border: `1.5px solid ${isAll ? A : T.outline}`,
          }}
        >Crâne entier</button>
      </div>

      {/* Selected zone chips */}
      {selected.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10, justifyContent: 'center' }}>
          {selected.map(s => (
            <span
              key={s}
              onClick={() => toggle(s)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 16, cursor: 'pointer',
                background: A + '22', color: A, fontSize: 12, fontWeight: 600,
                border: `1px solid ${A}44`,
              }}
            >{s} <span style={{ opacity: 0.6, fontSize: 13 }}>×</span></span>
          ))}
        </div>
      )}
    </div>
  )
}
