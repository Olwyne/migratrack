import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { usePrefs } from '../store/prefs'
import { useAuth } from '../store/auth'
import { useCrisis, CustomItem } from '../store/crisis'
import { ACCENTS } from '../tokens'
import { Icon } from '../components/ui/Icon'
import { Card } from '../components/ui/Card'
import { TreatmentSchedule } from '../data/types'

type Page = 'root' | 'traitements' | 'apparence' | 'compte' | 'perso'

interface Props { onClose: () => void }

export function SettingsScreen({ onClose }: Props) {
  const [page, setPage] = useState<Page>('root')

  if (page === 'traitements') return <TraitementsPage   onBack={() => setPage('root')} />
  if (page === 'apparence')   return <ApparencePage     onBack={() => setPage('root')} />
  if (page === 'compte')      return <ComptePage        onBack={() => setPage('root')} onClose={onClose} />
  if (page === 'perso')       return <PersonnalisationPage onBack={() => setPage('root')} />

  return <RootPage onClose={onClose} onNav={setPage} />
}

// ─── Root ────────────────────────────────────────────────────────────────────

function RootPage({ onClose, onNav }: { onClose: () => void; onNav: (p: Page) => void }) {
  const { T, A } = useTheme()
  const { crises } = useCrisis()

  const items: { page: Page; icon: string; label: string; sub: string }[] = [
    { page: 'traitements', icon: 'pill',      label: 'Traitements',       sub: 'Médicaments quotidiens' },
    { page: 'perso',       icon: 'bolt',      label: 'Personnalisation',  sub: 'Symptômes & déclencheurs' },
    { page: 'apparence',   icon: 'moon',      label: 'Apparence',         sub: 'Thème, couleur, densité' },
    { page: 'compte',      icon: 'user',      label: 'Compte',            sub: 'Connexion, données' },
  ]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      <PageHeader title="Paramètres" onBack={onClose} backIcon="close" />

      <Card pad={0} style={{ marginBottom: 24 }}>
        {items.map((item, i) => (
          <button key={item.page} onClick={() => onNav(item.page)} style={{
            display: 'flex', alignItems: 'center', gap: 14, width: '100%',
            padding: '16px 18px', background: 'transparent', border: 'none', cursor: 'pointer',
            borderBottom: i < items.length - 1 ? `1px solid ${T.outline}` : 'none',
            textAlign: 'left', fontFamily: 'inherit',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: A + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name={item.icon} size={19} color={A} stroke={2} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.onSurface }}>{item.label}</div>
              <div style={{ fontSize: 12.5, color: T.onSurfaceVariant, marginTop: 2 }}>{item.sub}</div>
            </div>
            <Icon name="chevronR" size={18} color={T.onSurfaceVariant} stroke={2} />
          </button>
        ))}
      </Card>

      <div style={{ fontSize: 12.5, color: T.onSurfaceVariant, textAlign: 'center', marginTop: 8 }}>
        MigraTrack v2.0 · PWA · {crises.length} crise{crises.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}

// ─── Traitements ─────────────────────────────────────────────────────────────

function TraitementsPage({ onBack }: { onBack: () => void }) {
  const { T, A } = useTheme()
  const { schedules, saveSchedule, deleteSchedule } = useCrisis()
  const [adding, setAdding] = useState(false)
  const [editing, setEditing] = useState<TreatmentSchedule | null>(null)

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      <PageHeader title="Traitements" onBack={onBack} />

      <div style={{ marginBottom: 16 }}>
        <Card pad={0}>
          {schedules.length === 0 && !adding && (
            <div style={{ padding: '18px', fontSize: 14, color: T.onSurfaceVariant }}>
              Aucun traitement configuré
            </div>
          )}
          {schedules.map((s, i) => (
            editing?.id === s.id ? (
              <ScheduleForm key={s.id} initial={s}
                onSave={ns => { saveSchedule(ns); setEditing(null) }}
                onCancel={() => setEditing(null)} />
            ) : (
              <ScheduleRow key={s.id} schedule={s}
                isLast={i === schedules.length - 1 && !adding}
                onToggle={() => saveSchedule({ ...s, active: !s.active })}
                onEdit={() => { setAdding(false); setEditing(s) }}
                onDelete={() => deleteSchedule(s.id)} />
            )
          ))}
          {adding && (
            <ScheduleForm
              onSave={s => { saveSchedule(s); setAdding(false) }}
              onCancel={() => setAdding(false)} />
          )}
        </Card>
      </div>

      {!adding && !editing && (
        <button onClick={() => setAdding(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'transparent', border: `1.5px dashed ${A}66`, borderRadius: 12,
          padding: '12px 16px', cursor: 'pointer', fontFamily: 'inherit',
          color: A, fontSize: 14, fontWeight: 650,
        }}>
          <Icon name="plus" size={16} color={A} stroke={2.3} />
          Ajouter un traitement
        </button>
      )}
    </div>
  )
}

function ScheduleRow({ schedule: s, isLast, onToggle, onEdit, onDelete }: {
  schedule: TreatmentSchedule; isLast: boolean
  onToggle: () => void; onEdit: () => void; onDelete: () => void
}) {
  const { T } = useTheme()
  return (
    <div style={{ padding: '14px 18px', borderBottom: isLast ? 'none' : `1px solid ${T.outline}`, display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontWeight: 700, color: s.active ? T.onSurface : T.onSurfaceVariant, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {s.name}
        </div>
        <div style={{ fontSize: 12.5, color: T.onSurfaceVariant, marginTop: 2 }}>
          {s.dose}{s.times.length ? ` · ${s.times.join(', ')}` : ''}
        </div>
      </div>
      <button onClick={onEdit} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: T.cardTint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="edit" size={15} color={T.onSurfaceVariant} stroke={2} />
      </button>
      <button onClick={onDelete} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: '#E5737318', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="trash" size={15} color="#E57373" stroke={2} />
      </button>
      <Toggle value={s.active} onChange={onToggle} />
    </div>
  )
}

function ScheduleForm({ initial, onSave, onCancel }: {
  initial?: TreatmentSchedule
  onSave: (s: TreatmentSchedule) => void
  onCancel: () => void
}) {
  const { T, A } = useTheme()
  const [name, setName] = useState(initial?.name ?? '')
  const [dose, setDose] = useState(initial?.dose ?? '')
  const [timesStr, setTimesStr] = useState(initial?.times.join(', ') ?? '')

  const inputStyle = {
    width: '100%', boxSizing: 'border-box' as const,
    padding: '9px 12px', borderRadius: 10, border: `1.5px solid ${T.fieldBorder}`,
    background: T.field, color: T.onSurface, fontFamily: 'inherit', fontSize: 14, outline: 'none',
  }

  const handleSave = () => {
    if (!name.trim()) return
    const times = timesStr.split(',').map(t => t.trim()).filter(t => /^\d{2}:\d{2}$/.test(t))
    onSave({ id: initial?.id ?? `sch_${Date.now()}`, name: name.trim(), dose: dose.trim(), times, active: initial?.active ?? true })
  }

  return (
    <div style={{ padding: '16px 18px', borderTop: `1px solid ${T.outline}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <input placeholder="Nom du médicament" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
      <input placeholder="Dose (ex: 50 mg)" value={dose} onChange={e => setDose(e.target.value)} style={inputStyle} />
      <input placeholder="Horaires (ex: 08:00, 21:00)" value={timesStr} onChange={e => setTimesStr(e.target.value)} style={inputStyle} />
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '8px 16px', borderRadius: 10, border: `1.5px solid ${T.outline}`, background: 'transparent', color: T.onSurfaceVariant, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 650 }}>Annuler</button>
        <button onClick={handleSave} style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: A, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}>{initial ? 'Enregistrer' : 'Ajouter'}</button>
      </div>
    </div>
  )
}

// ─── Apparence ───────────────────────────────────────────────────────────────

function ApparencePage({ onBack }: { onBack: () => void }) {
  const { T, A } = useTheme()
  const { dark, accent, density, fontScale, showSteps, showHydration, setDark, setAccent, setDensity, setFontScale, setShowSteps, setShowHydration } = usePrefs()

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      <PageHeader title="Apparence" onBack={onBack} />
      <Card pad={0}>
        <SettingRow label="Thème sombre" icon="moon">
          <Toggle value={dark} onChange={setDark} />
        </SettingRow>
        <SettingRow label="Couleur d'accent" icon="bolt">
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(ACCENTS).map(([key, val]) => {
              const color = val[dark ? 'dark' : 'light']
              return (
                <button key={key} onClick={() => setAccent(key)} title={key} style={{
                  width: 26, height: 26, borderRadius: 13,
                  border: accent === key ? `3px solid ${T.onSurface}` : '3px solid transparent',
                  background: color, cursor: 'pointer', outline: 'none', padding: 0,
                }} />
              )
            })}
          </div>
        </SettingRow>
        <SettingRow label="Densité" icon="settings">
          <div style={{ display: 'flex', gap: 6 }}>
            {(['compact', 'regular', 'comfy'] as const).map(d => (
              <button key={d} onClick={() => setDensity(d)} style={{
                padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 12, fontFamily: 'inherit', fontWeight: 650,
                background: density === d ? A : T.cardTint, color: density === d ? '#fff' : T.onSurfaceVariant,
              }}>{d}</button>
            ))}
          </div>
        </SettingRow>
        <SettingRow label={`Texte (×${fontScale.toFixed(2)})`} icon="thermometer">
          <input type="range" min={0.9} max={1.15} step={0.05} value={fontScale}
            onChange={e => setFontScale(Number(e.target.value))}
            style={{ width: 100, accentColor: A }} />
        </SettingRow>
        <SettingRow label="Afficher les pas" icon="steps">
          <Toggle value={showSteps} onChange={setShowSteps} />
        </SettingRow>
        <SettingRow label="Afficher l'hydratation" icon="drop">
          <Toggle value={showHydration} onChange={setShowHydration} />
        </SettingRow>
      </Card>
    </div>
  )
}

// ─── Compte ──────────────────────────────────────────────────────────────────

function ComptePage({ onBack, onClose }: { onBack: () => void; onClose: () => void }) {
  const { T, A } = useTheme()
  const { user, signOut } = useAuth()
  const { crises } = useCrisis()

  const handleExport = () => {
    const json = JSON.stringify(crises, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'migratrack-backup.json'; a.click()
  }

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      <PageHeader title="Compte" onBack={onBack} />

      <Card pad={0} style={{ marginBottom: 20 }}>
        {user ? (
          <>
            <SettingRow label={user.email || 'Utilisateur'} icon="user">
              <span style={{ fontSize: 12, color: '#4CAF50', fontWeight: 600 }}>Connecté</span>
            </SettingRow>
            <SettingRow label="Se déconnecter" icon="logout">
              <button onClick={handleSignOut} style={{
                padding: '6px 14px', borderRadius: 10, border: `1.5px solid #E57373`,
                background: 'transparent', color: '#E57373', cursor: 'pointer',
                fontFamily: 'inherit', fontSize: 13, fontWeight: 650,
              }}>Déconnexion</button>
            </SettingRow>
          </>
        ) : (
          <SettingRow label="Non connecté" icon="user">
            <span style={{ fontSize: 12, color: T.onSurfaceVariant }}>Mode local</span>
          </SettingRow>
        )}
      </Card>

      <Card pad={0}>
        <SettingRow label="Exporter les données" icon="download">
          <button onClick={handleExport} style={{
            padding: '6px 14px', borderRadius: 10, border: `1.5px solid ${A}66`,
            background: 'transparent', color: A, cursor: 'pointer',
            fontFamily: 'inherit', fontSize: 13, fontWeight: 650,
          }}>JSON</button>
        </SettingRow>
        <SettingRow label={`${crises.length} crise${crises.length !== 1 ? 's' : ''} enregistrée${crises.length !== 1 ? 's' : ''}`} icon="database" />
      </Card>
    </div>
  )
}

// ─── Personnalisation ────────────────────────────────────────────────────────

function PersonnalisationPage({ onBack }: { onBack: () => void }) {
  const { customSymptoms, customTriggers, saveCustomSymptom, deleteCustomSymptom, saveCustomTrigger, deleteCustomTrigger } = useCrisis()

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      <PageHeader title="Personnalisation" onBack={onBack} />
      <CustomItemSection
        title="Symptômes personnalisés"
        items={customSymptoms}
        prefix="custom_symptom"
        onSave={saveCustomSymptom}
        onDelete={deleteCustomSymptom}
      />
      <CustomItemSection
        title="Déclencheurs personnalisés"
        items={customTriggers}
        prefix="custom_trigger"
        onSave={saveCustomTrigger}
        onDelete={deleteCustomTrigger}
      />
    </div>
  )
}

function CustomItemSection({ title, items, prefix, onSave, onDelete }: {
  title: string
  items: CustomItem[]
  prefix: string
  onSave: (item: CustomItem) => void
  onDelete: (key: string) => void
}) {
  const { T, A } = useTheme()
  const [adding, setAdding] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 2px 10px' }}>{title}</div>
      <Card pad={0} style={{ marginBottom: 10 }}>
        {items.length === 0 && !adding && (
          <div style={{ padding: '16px 18px', fontSize: 14, color: T.onSurfaceVariant }}>Aucun élément personnalisé</div>
        )}
        {items.map((item, i) => (
          editingKey === item.key ? (
            <CustomItemForm
              key={item.key}
              initial={item}
              prefix={prefix}
              onSave={v => { onSave(v); setEditingKey(null) }}
              onCancel={() => setEditingKey(null)}
            />
          ) : (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: i < items.length - 1 || adding ? `1px solid ${T.outline}` : 'none' }}>
              <span style={{ flex: 1, fontSize: 14.5, fontWeight: 600, color: T.onSurface }}>{item.label}</span>
              <button onClick={() => { setAdding(false); setEditingKey(item.key) }} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: T.cardTint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="edit" size={15} color={T.onSurfaceVariant} stroke={2} />
              </button>
              <button onClick={() => onDelete(item.key)} style={{ width: 32, height: 32, borderRadius: 9, border: 'none', background: '#E5737318', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="trash" size={15} color="#E57373" stroke={2} />
              </button>
            </div>
          )
        ))}
        {adding && (
          <CustomItemForm
            prefix={prefix}
            onSave={v => { onSave(v); setAdding(false) }}
            onCancel={() => setAdding(false)}
          />
        )}
      </Card>
      {!adding && !editingKey && (
        <button onClick={() => setAdding(true)} style={{
          display: 'flex', alignItems: 'center', gap: 8, width: '100%',
          background: 'transparent', border: `1.5px dashed ${A}66`, borderRadius: 12,
          padding: '10px 16px', cursor: 'pointer', fontFamily: 'inherit',
          color: A, fontSize: 14, fontWeight: 650,
        }}>
          <Icon name="plus" size={16} color={A} stroke={2.3} />
          Ajouter
        </button>
      )}
    </div>
  )
}

function CustomItemForm({ initial, prefix, onSave, onCancel }: {
  initial?: CustomItem
  prefix: string
  onSave: (item: CustomItem) => void
  onCancel: () => void
}) {
  const { T, A } = useTheme()
  const [label, setLabel] = useState(initial?.label ?? '')

  return (
    <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.outline}`, display: 'flex', gap: 8 }}>
      <input
        placeholder="Nom…" value={label} onChange={e => setLabel(e.target.value)}
        autoFocus
        style={{ flex: 1, padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${T.fieldBorder}`, background: T.field, color: T.onSurface, fontFamily: 'inherit', fontSize: 14, outline: 'none' }}
      />
      <button onClick={onCancel} style={{ padding: '8px 12px', borderRadius: 10, border: `1.5px solid ${T.outline}`, background: 'transparent', color: T.onSurfaceVariant, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 650 }}>✕</button>
      <button
        onClick={() => { if (label.trim()) onSave({ key: initial?.key ?? `${prefix}_${Date.now()}`, label: label.trim() }) }}
        disabled={!label.trim()}
        style={{ padding: '8px 14px', borderRadius: 10, border: 'none', background: label.trim() ? A : T.outline, color: '#fff', cursor: label.trim() ? 'pointer' : 'default', fontFamily: 'inherit', fontSize: 13, fontWeight: 700 }}
      >{initial ? '✓' : 'OK'}</button>
    </div>
  )
}

// ─── Shared components ───────────────────────────────────────────────────────

function PageHeader({ title, onBack, backIcon = 'chevronL' }: { title: string; onBack: () => void; backIcon?: string }) {
  const { T } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, position: 'sticky', top: 0, zIndex: 10, background: T.bg, paddingTop: 14, paddingBottom: 8 }}>
      <button onClick={onBack} style={{ width: 40, height: 40, borderRadius: 20, border: 'none', background: T.cardTint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={backIcon} size={20} color={T.onSurface} stroke={2.2} />
      </button>
      <h1 style={{ fontSize: 22, fontWeight: 820, color: T.onSurface, margin: 0, letterSpacing: -0.4 }}>{title}</h1>
    </div>
  )
}

function SettingRow({ label, icon, children }: { label: string; icon: string; children?: React.ReactNode }) {
  const { T, A } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderBottom: `1px solid ${T.outline}` }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: A + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon name={icon} size={16} color={A} stroke={2} />
      </div>
      <span style={{ flex: 1, fontSize: 14.5, color: T.onSurface, fontWeight: 600 }}>{label}</span>
      {children}
    </div>
  )
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  const { A } = useTheme()
  return (
    <button onClick={() => onChange(!value)} style={{
      width: 48, height: 28, borderRadius: 14, border: 'none', cursor: 'pointer',
      background: value ? A : 'rgba(120,120,128,0.3)', transition: 'background .2s',
      position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3, width: 22, height: 22,
        borderRadius: 11, background: '#fff', transition: 'left .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}
