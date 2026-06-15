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

const ZONES: Zone[] = [
  { id: 'Vertex',        short: 'Vertex',   lx: 100, ly: 28, shape: 'ellipse', sp: { cx: 100, cy: 26, rx: 52, ry: 20 } },
  { id: 'Front',         short: 'Front',    lx: 100, ly: 64, shape: 'rect',    sp: { x: 44, y: 44, width: 112, height: 40 } },
  { id: 'Tempe droite',  short: 'Tempe D',  lx: 37,  ly: 82, shape: 'rect',    sp: { x: 18, y: 48, width: 40, height: 70 } },
  { id: 'Tempe gauche',  short: 'Tempe G',  lx: 163, ly: 82, shape: 'rect',    sp: { x: 142, y: 48, width: 40, height: 70 } },
  { id: 'Œil droit',    short: 'Œil D',    lx: 78,  ly: 118, shape: 'ellipse', sp: { cx: 78, cy: 110, rx: 22, ry: 14 } },
  { id: 'Œil gauche',   short: 'Œil G',    lx: 122, ly: 118, shape: 'ellipse', sp: { cx: 122, cy: 110, rx: 22, ry: 14 } },
  { id: 'Nuque',         short: 'Nuque',    lx: 100, ly: 168, shape: 'rect',    sp: { x: 46, y: 156, width: 108, height: 28 } },
]

function ZoneShape({ z, fill, stroke, strokeWidth }: { z: Zone; fill: string; stroke: string; strokeWidth: number }) {
  if (z.shape === 'ellipse') {
    const p = z.sp as EllipseSp
    return <ellipse cx={p.cx} cy={p.cy} rx={p.rx} ry={p.ry} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
  }
  const p = z.sp as RectSp
  return <rect x={p.x} y={p.y} width={p.width} height={p.height} fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
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
      <svg viewBox="0 0 200 210" style={{ width: '100%', maxWidth: 230, display: 'block', margin: '0 auto', userSelect: 'none', touchAction: 'manipulation' }}>
        <defs>
          <clipPath id="hd-clip">
            <ellipse cx="100" cy="98" rx="73" ry="83" />
          </clipPath>
        </defs>

        {/* Head fill */}
        <ellipse cx="100" cy="98" rx="73" ry="83"
          fill={dark ? '#1a1825' : '#F6F4FB'}
          stroke={isAll ? A : deco}
          strokeWidth={isAll ? 2.5 : 1.5}
        />

        {/* Zone overlays (clipped to head) */}
        <g clipPath="url(#hd-clip)">
          {ZONES.map(z => {
            const sel = isAll || selected.includes(z.id)
            return (
              <g key={z.id} onClick={() => toggle(z.id)} style={{ cursor: 'pointer' }}>
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

        {/* Face decorations — for orientation only */}
        {/* Ears */}
        <path d="M27 88 Q15 100 27 116" fill="none" stroke={deco} strokeWidth="1.4" strokeLinecap="round" />
        <path d="M173 88 Q185 100 173 116" fill="none" stroke={deco} strokeWidth="1.4" strokeLinecap="round" />
        {/* Eyebrows */}
        <path d="M62 97 Q78 91 94 97" fill="none" stroke={deco} strokeWidth="1.5" strokeLinecap="round" />
        <path d="M106 97 Q122 91 138 97" fill="none" stroke={deco} strokeWidth="1.5" strokeLinecap="round" />
        {/* Eyes */}
        <ellipse cx="78" cy="109" rx="11" ry="7" fill="none" stroke={deco} strokeWidth="1.2" />
        <ellipse cx="122" cy="109" rx="11" ry="7" fill="none" stroke={deco} strokeWidth="1.2" />
        {/* Nose */}
        <path d="M96 122 Q100 132 104 122" fill="none" stroke={deco} strokeWidth="1.2" strokeLinecap="round" />
        {/* Mouth */}
        <path d="M88 147 Q100 155 112 147" fill="none" stroke={deco} strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      {/* Crâne entier chip */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
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

      {/* Selected tags */}
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
