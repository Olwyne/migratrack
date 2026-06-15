import { useState, useRef, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { MigraineCrisis, TreatmentEntry, SYMPTOM_KEYS, TRIGGER_KEYS, SYMPTOMS, TRIGGERS } from '../data/types'
import { HeadDiagram } from '../components/ui/HeadDiagram'
import { useCrisis } from '../store/crisis'
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
  onUpdate?: (c: MigraineCrisis) => void
  onDelete?: (id: string) => void
}

export function CrisisDetailScreen({ crisis, isNew, onClose, onSave, onUpdate, onDelete }: Props) {
  const { T, A, dark } = useTheme()
  const { customSymptoms, customTriggers, schedules } = useCrisis()

  const [intensity, setIntensity] = useState(crisis.intensity || 5)
  const [locations, setLocations] = useState<string[]>(
    (crisis as any).locations ?? ((crisis as any).location ? [(crisis as any).location] : [])
  )
  const [symptoms, setSymptoms] = useState<string[]>(crisis.symptoms)
  const [triggers, setTriggers] = useState<string[]>(crisis.triggers)
  const [treatments, setTreatments] = useState<TreatmentEntry[]>(crisis.treatments)
  const [intensityHistory, setIntensityHistory] = useState(crisis.intensityHistory)
  const [notes, setNotes] = useState(crisis.notes)
  const [addingTreatment, setAddingTreatment] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  const isOngoing = !crisis.end

  // Tick elapsed time for ongoing crisis
  useEffect(() => {
    if (!isOngoing) return
    const tick = () => setElapsed(Math.round((Date.now() - crisis.start.getTime()) / 60000))
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [isOngoing, crisis.start])

  const allSymptoms = { ...SYMPTOMS, ...Object.fromEntries(customSymptoms.map(x => [x.key, x.label])) }
  const allSymptomKeys = [...SYMPTOM_KEYS, ...customSymptoms.map(x => x.key)]
  const allTriggers = { ...TRIGGERS, ...Object.fromEntries(customTriggers.map(x => [x.key, x.label])) }
  const allTriggerKeys = [...TRIGGER_KEYS, ...customTriggers.map(x => x.key)]

  const toggle = (arr: string[], set: (v: string[]) => void, key: string) =>
    set(arr.includes(key) ? arr.filter(x => x !== key) : [...arr, key])

  const removeTreatment = (i: number) => setTreatments(ts => ts.filter((_, j) => j !== i))
  const setTreatmentEff = (i: number, eff: number) =>
    setTreatments(ts => ts.map((t, j) => j === i ? { ...t, eff } : t))

  const dur = crisis.end ? Math.round((crisis.end.getTime() - crisis.start.getTime()) / 60000) : null
  const c = intensityColor(intensity)

  const buildCrisis = () => ({ ...crisis, intensity, locations, symptoms, triggers, treatments, intensityHistory, notes })

  const handleSave = () => onSave(buildCrisis())

  const handleAddTreatment = (name: string, eff: number) => {
    const updated = [...treatments, { name, eff, takenAt: new Date() }]
    setTreatments(updated)
    setAddingTreatment(false)
    if (isOngoing && onUpdate) onUpdate({ ...buildCrisis(), treatments: updated })
  }

  const handleLogIntensity = (v: number) => {
    const entry = { t: new Date(), v }
    const updated = [...intensityHistory, entry]
    setIntensityHistory(updated)
    setIntensity(v)
    if (onUpdate) onUpdate({ ...buildCrisis(), intensity: v, intensityHistory: updated })
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

      {/* Live tracker — only for ongoing crisis */}
      {isOngoing && (
        <LiveTracker
          elapsed={elapsed}
          currentIntensity={intensity}
          schedules={schedules}
          existingTreatments={treatments}
          onLogIntensity={handleLogIntensity}
          onLogTreatment={(name, eff) => handleAddTreatment(name, eff)}
          onEnd={() => onSave({ ...buildCrisis(), end: new Date() })}
        />
      )}

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
        {intensityHistory && intensityHistory.length > 1 && (
          <div style={{ marginTop: 18 }}>
            <Eyebrow style={{ marginBottom: 6 }}>Évolution</Eyebrow>
            <IntensityLine history={intensityHistory} treatments={treatments} start={crisis.start} end={crisis.end} height={170} />
          </div>
        )}
      </Card>

      {/* Location */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 12 }}>Localisation</Eyebrow>
        <HeadDiagram selected={locations} onChange={setLocations} />
      </Card>

      {/* Symptoms */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 13 }}>Symptômes</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {allSymptomKeys.map(k => (
            <Chip key={k} label={allSymptoms[k]} selected={symptoms.includes(k)}
              onClick={() => toggle(symptoms, setSymptoms, k)} />
          ))}
        </div>
      </Card>

      {/* Triggers */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <Eyebrow style={{ marginBottom: 13 }}>Déclencheurs possibles</Eyebrow>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {allTriggerKeys.map(k => (
            <Chip key={k} label={allTriggers[k]} selected={triggers.includes(k)}
              onClick={() => toggle(triggers, setTriggers, k)} />
          ))}
        </div>
      </Card>

      {/* Treatments */}
      <Card pad={18} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
          <Eyebrow>Traitements pris</Eyebrow>
          {!addingTreatment && (
            <button onClick={() => setAddingTreatment(true)} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'transparent', border: `1.5px solid ${A}55`, borderRadius: 8, padding: '4px 10px', cursor: 'pointer', color: A, fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit' }}>
              <Icon name="plus" size={13} color={A} stroke={2.5} />Ajouter
            </button>
          )}
        </div>

        {treatments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: addingTreatment ? 14 : 0 }}>
            {treatments.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: A + (dark ? '24' : '14'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="pill" size={17} color={A} stroke={2.1} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 650, color: T.onSurface, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.name}</div>
                  <div style={{ display: 'flex', gap: 3, marginTop: 4 }}>
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setTreatmentEff(i, s)} style={{ width: 18, height: 18, borderRadius: 18, border: 'none', cursor: 'pointer', padding: 0, background: s <= t.eff ? A : T.outline }} />
                    ))}
                  </div>
                </div>
                <button onClick={() => removeTreatment(i)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: '#E5737318', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="close" size={14} color="#E57373" stroke={2.5} />
                </button>
              </div>
            ))}
          </div>
        )}

        {treatments.length === 0 && !addingTreatment && (
          <div style={{ fontSize: 13, color: T.onSurfaceVariant, marginBottom: 0 }}>Aucun traitement enregistré</div>
        )}

        {addingTreatment && (
          <TreatmentPicker
            schedules={schedules}
            existing={treatments.map(t => t.name)}
            onAdd={handleAddTreatment}
            onCancel={() => setAddingTreatment(false)}
          />
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

// ── Live tracker ─────────────────────────────────────────────
function LiveTracker({ elapsed, currentIntensity, schedules, existingTreatments, onLogIntensity, onLogTreatment, onEnd }: {
  elapsed: number
  currentIntensity: number
  schedules: import('../data/types').TreatmentSchedule[]
  existingTreatments: TreatmentEntry[]
  onLogIntensity: (v: number) => void
  onLogTreatment: (name: string, eff: number) => void
  onEnd: () => void
}) {
  const { T, A } = useTheme()
  const [liveIntensity, setLiveIntensity] = useState(currentIntensity)
  const [showTreatment, setShowTreatment] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleLog = () => {
    onLogIntensity(liveIntensity)
    setSaved(true)
    setTimeout(() => setSaved(false), 1800)
  }

  const now = new Date()
  const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`

  return (
    <div style={{ marginBottom: 16, border: `2px solid ${A}`, borderRadius: 16, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ background: A + '18', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ position: 'relative', width: 9, height: 9, flexShrink: 0 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 9, background: A, animation: 'pulseDot 1.6s ease-out infinite' }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: 9, background: A }} />
        </span>
        <span style={{ fontWeight: 800, fontSize: 14, color: A }}>Suivi en direct</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, color: T.onSurfaceVariant, fontWeight: 600 }}>depuis {fmtDur(elapsed)}</span>
      </div>

      {/* Intensity log */}
      <div style={{ padding: '14px 18px', borderBottom: `1px solid ${T.outline}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: T.onSurface }}>Intensité à {timeStr}</span>
          <span style={{ fontSize: 22, fontWeight: 820, color: intensityColor(liveIntensity) }}>{liveIntensity}<span style={{ fontSize: 13, color: T.onSurfaceVariant, fontWeight: 600 }}>/10</span></span>
        </div>
        <IntensitySlider value={liveIntensity} onChange={setLiveIntensity} />
        <button onClick={handleLog} style={{
          marginTop: 12, width: '100%', padding: '10px', borderRadius: 12, border: 'none',
          background: saved ? '#4CAF50' : A, color: '#fff', fontFamily: 'inherit',
          fontSize: 14, fontWeight: 700, cursor: 'pointer', transition: 'background .3s',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
        }}>
          <Icon name={saved ? 'check' : 'plus'} size={16} color="#fff" stroke={2.5} />
          {saved ? 'Mesure enregistrée !' : 'Enregistrer cette mesure'}
        </button>
      </div>

      {/* Treatment log */}
      <div style={{ padding: '12px 18px' }}>
        {!showTreatment ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button onClick={() => setShowTreatment(true)} style={{
              width: '100%', padding: '9px', borderRadius: 12,
              border: `1.5px dashed ${A}66`, background: 'transparent',
              color: A, fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <Icon name="pill" size={15} color={A} stroke={2.2} />
              J'ai pris un traitement
            </button>
            <button onClick={onEnd} style={{
              width: '100%', padding: '9px', borderRadius: 12,
              border: 'none', background: '#4CAF5018',
              color: '#4CAF50', fontFamily: 'inherit', fontSize: 13.5, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
            }}>
              <Icon name="check" size={15} color="#4CAF50" stroke={2.5} />
              Terminer la crise maintenant
            </button>
          </div>
        ) : (
          <TreatmentPicker
            schedules={schedules}
            existing={existingTreatments.map(t => t.name)}
            onAdd={(name, eff) => { onLogTreatment(name, eff); setShowTreatment(false) }}
            onCancel={() => setShowTreatment(false)}
          />
        )}
      </div>
    </div>
  )
}

// ── Treatment picker ──────────────────────────────────────────
function TreatmentPicker({ schedules, existing, onAdd, onCancel }: {
  schedules: import('../data/types').TreatmentSchedule[]
  existing: string[]
  onAdd: (name: string, eff: number) => void
  onCancel: () => void
}) {
  const { T, A } = useTheme()
  const [name, setName] = useState('')
  const [eff, setEff] = useState(3)

  const suggestions = schedules
    .filter(s => s.active && !existing.includes(s.name))
    .map(s => s.name)

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.fieldBorder}`,
    background: T.field, color: T.onSurface, fontFamily: 'inherit', fontSize: 14, outline: 'none',
  }

  return (
    <div style={{ borderTop: `1px solid ${T.outline}`, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {suggestions.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {suggestions.map(s => (
            <button key={s} onClick={() => setName(s)} style={{
              padding: '5px 12px', borderRadius: 20, border: `1.5px solid ${name === s ? A : T.outline}`,
              background: name === s ? A + '18' : 'transparent', color: name === s ? A : T.onSurfaceVariant,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 650,
            }}>{s}</button>
          ))}
        </div>
      )}
      <input placeholder="Nom du médicament" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
      <div>
        <div style={{ fontSize: 12, color: T.onSurfaceVariant, marginBottom: 6, fontWeight: 600 }}>Efficacité</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[1,2,3,4,5].map(s => (
            <button key={s} onClick={() => setEff(s)} style={{
              width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
              background: s <= eff ? A : T.cardTint, color: s <= eff ? '#fff' : T.onSurfaceVariant,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700,
            }}>{s}</button>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${T.outline}`, background: 'transparent', color: T.onSurfaceVariant, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 650 }}>Annuler</button>
        <button onClick={() => name.trim() && onAdd(name.trim(), eff)} disabled={!name.trim()} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: name.trim() ? A : T.outline, color: '#fff', cursor: name.trim() ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>Ajouter</button>
      </div>
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
