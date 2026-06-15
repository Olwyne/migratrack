import { useState, useRef } from 'react'
import { useTheme } from '../hooks/useTheme'
import { MigraineCrisis, SYMPTOM_KEYS, TRIGGER_KEYS, SYMPTOMS, TRIGGERS, LOCATIONS } from '../data/types'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { PrimaryButton, IconButton } from '../components/ui/Buttons'
import { Chip } from '../components/ui/Chip'
import { Eyebrow } from '../components/ui/Primitives'
import { IntensityLine } from '../components/charts/IntensityLine'
import { intensityColor, intensityBand } from '../tokens'
import { capitalize, longDate, hhmm, fmtDur, MONTHS_FR } from '../utils/date'

interface Props {
  crisis: MigraineCrisis
  isNew: boolean
  onClose: () => void
  onSave: (c: MigraineCrisis) => void
  onDelete?: (id: string) => void
}

export function CrisisDetailScreen({ crisis, isNew, onClose, onSave, onDelete }: Props) {
  const { T, A, dark } = useTheme()
  const [intensity, setIntensity] = useState(crisis.intensity || 5)
  const [location, setLocation] = useState<string | null>(crisis.location)
  const [symptoms, setSymptoms] = useState<string[]>(crisis.symptoms)
  const [triggers, setTriggers] = useState<string[]>(crisis.triggers)
  const [notes, setNotes] = useState(crisis.notes)

  const toggle = (arr: string[], set: (v: string[]) => void, key: string) =>
    set(arr.includes(key) ? arr.filter(x => x !== key) : [...arr, key])

  const dur = crisis.end ? Math.round((crisis.end.getTime() - crisis.start.getTime()) / 60000) : null
  const c = intensityColor(intensity)

  const handleSave = () => {
    onSave({ ...crisis, intensity, location, symptoms, triggers, notes })
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, position: 'sticky', top: 0, zIndex: 10, background: T.bg, paddingTop: 14, paddingBottom: 8 }}>
        <IconButton icon={isNew ? 'close' : 'chevronL'} onClick={onClose} />
        <span style={{ fontSize: 16, fontWeight: 750, color: T.onSurface }}>{isNew ? 'Nouvelle crise' : 'Détail de la crise'}</span>
        {!isNew && onDelete ? (
          <button onClick={() => onDelete(crisis.id)} style={{ width: 40, height: 40, borderRadius: 20, border: 'none', background: T.cardTint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="trash" size={19} color="#E08A82" stroke={2} />
          </button>
        ) : <div style={{ width: 40 }} />}
      </div>

      {/* Date/time banner */}
      <Card pad={16} style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: A + (dark ? '26' : '14'), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 17, fontWeight: 820, color: A, lineHeight: 1 }}>{crisis.start.getDate()}</span>
          <span style={{ fontSize: 9.5, fontWeight: 700, color: A, textTransform: 'uppercase' }}>{MONTHS_FR[crisis.start.getMonth()].slice(0,3)}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.onSurface }}>{capitalize(longDate(crisis.start))}</div>
          <div style={{ fontSize: 12.5, color: T.onSurfaceVariant, marginTop: 2 }}>
            {hhmm(crisis.start)}{crisis.end ? ` – ${hhmm(crisis.end)}` : ' · en cours'}{dur != null ? ` · ${fmtDur(dur)}` : ''}
          </div>
        </div>
        {crisis.weatherPressure && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
              <Icon name="cloud" size={15} color={T.onSurfaceVariant} stroke={2} />
              <span style={{ fontSize: 13, fontWeight: 700, color: T.onSurface }}>{crisis.weatherPressure}</span>
            </div>
            <div style={{ fontSize: 10.5, color: T.onSurfaceVariant, marginTop: 1 }}>hPa</div>
          </div>
        )}
      </Card>

      {/* Intensity */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Eyebrow>Intensité de la douleur</Eyebrow>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 26, fontWeight: 820, color: c, lineHeight: 1 }}>{intensity}</span>
            <span style={{ fontSize: 14, color: T.onSurfaceVariant, fontWeight: 600 }}>/10 · {intensityBand(intensity)}</span>
          </div>
        </div>
        <IntensitySlider value={intensity} onChange={setIntensity} />
        {crisis.intensityHistory && crisis.intensityHistory.length > 1 && (
          <div style={{ marginTop: 18 }}>
            <Eyebrow style={{ marginBottom: 6 }}>Évolution</Eyebrow>
            <IntensityLine history={crisis.intensityHistory} treatments={crisis.treatments} start={crisis.start} end={crisis.end} height={170} />
          </div>
        )}
      </Card>

      {/* Location */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 13 }}>Localisation</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LOCATIONS.map(l => <Chip key={l} label={l} selected={location === l} onClick={() => setLocation(location === l ? null : l)} />)}
        </div>
      </Card>

      {/* Symptoms */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 13 }}>Symptômes</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SYMPTOM_KEYS.map(k => <Chip key={k} label={SYMPTOMS[k]} selected={symptoms.includes(k)} onClick={() => toggle(symptoms, setSymptoms, k)} />)}
        </div>
      </Card>

      {/* Triggers */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 13 }}>Déclencheurs possibles</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TRIGGER_KEYS.map(k => <Chip key={k} label={TRIGGERS[k]} selected={triggers.includes(k)} onClick={() => toggle(triggers, setTriggers, k)} />)}
        </div>
      </Card>

      {/* Treatments */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 13 }}>Traitements pris</Eyebrow>
        {crisis.treatments && crisis.treatments.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {crisis.treatments.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: A + (dark ? '24' : '14'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="pill" size={18} color={A} stroke={2.1} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 650, color: T.onSurface }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: T.onSurfaceVariant }}>{t.takenAt ? `Pris à ${hhmm(t.takenAt)}` : ''}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 2.5, marginBottom: 2 }}>
                    {[1,2,3,4,5].map(s => <span key={s} style={{ width: 8, height: 8, borderRadius: 8, background: s <= t.eff ? A : T.outline }} />)}
                  </div>
                  <div style={{ fontSize: 10.5, color: T.onSurfaceVariant }}>efficacité</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: T.onSurfaceVariant }}>Aucun traitement enregistré</div>
        )}
      </Card>

      {/* Notes */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 11 }}>Notes</Eyebrow>
        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Contexte, ressenti, observations…"
          style={{
            width: '100%', minHeight: 70, resize: 'none',
            border: `1.5px solid ${T.fieldBorder}`, borderRadius: 12,
            background: T.field, color: T.onSurface, padding: 12,
            fontFamily: 'inherit', fontSize: 14, lineHeight: 1.5,
            boxSizing: 'border-box', outline: 'none',
          }} />
      </Card>

      <PrimaryButton icon="check" onClick={handleSave} style={{ marginBottom: 8 }}>
        {isNew ? 'Enregistrer la crise' : 'Enregistrer les modifications'}
      </PrimaryButton>
    </div>
  )
}

// ── Intensity slider ──────────────────────────────────────────
function IntensitySlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const { T, dark } = useTheme()
  const trackRef = useRef<HTMLDivElement>(null)

  const set = (clientX: number) => {
    if (!trackRef.current) return
    const r = trackRef.current.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
    onChange(Math.round(1 + ratio * 9))
  }

  const onDown = (e: React.PointerEvent) => {
    const move = (ev: PointerEvent) => set(ev.clientX)
    set(e.clientX)
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const pct = ((value - 1) / 9) * 100
  const c = intensityColor(value)

  return (
    <div>
      <div ref={trackRef} onPointerDown={onDown}
        style={{ position: 'relative', height: 36, display: 'flex', alignItems: 'center', cursor: 'pointer', touchAction: 'none' }}>
        <div style={{ position: 'absolute', left: 0, right: 0, height: 10, borderRadius: 10, background: 'linear-gradient(90deg, #4CAF50, #FFC107, #E57373)', opacity: dark ? 0.85 : 1 }} />
        <div style={{ position: 'absolute', left: `calc(${pct}% - 14px)`, width: 28, height: 28, borderRadius: 28, background: '#fff', border: `4px solid ${c}`, boxShadow: '0 2px 8px rgba(0,0,0,0.18)', transition: 'border-color .15s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, padding: '0 2px' }}>
        {[1,2,3,4,5,6,7,8,9,10].map(n => (
          <span key={n} style={{ fontSize: 10.5, fontWeight: n === value ? 800 : 500, color: n === value ? c : T.onSurfaceVariant }}>{n}</span>
        ))}
      </div>
    </div>
  )
}
