import { useTheme } from '../hooks/useTheme'
import { usePrefs } from '../store/prefs'
import { useAuth } from '../store/auth'
import { useCrisis } from '../store/crisis'
import { ACCENTS } from '../tokens'
import { Icon } from '../components/ui/Icon'
import { Card } from '../components/ui/Card'

interface Props { onClose: () => void }

export function SettingsScreen({ onClose }: Props) {
  const { T, A } = useTheme()
  const { dark, accent, density, fontScale, setDark, setAccent, setDensity, setFontScale } = usePrefs()
  const { user, signOut } = useAuth()
  const { crises } = useCrisis()

  const handleExport = () => {
    const json = JSON.stringify(crises, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'migratrack-backup.json'; a.click()
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 40 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, position: 'sticky', top: 0, zIndex: 10, background: T.bg, paddingTop: 14, paddingBottom: 8 }}>
        <button onClick={onClose} style={{ width: 40, height: 40, borderRadius: 20, border: 'none', background: T.cardTint, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="close" size={20} color={T.onSurface} stroke={2.2} />
        </button>
        <h1 style={{ fontSize: 22, fontWeight: 820, color: T.onSurface, margin: 0, letterSpacing: -0.4 }}>Paramètres</h1>
      </div>

      {/* Appearance */}
      <Section label="Apparence">
        <SettingRow label="Thème sombre" icon="moon">
          <Toggle value={dark} onChange={setDark} />
        </SettingRow>
        <SettingRow label="Couleur d'accent" icon="bolt">
          <div style={{ display: 'flex', gap: 8 }}>
            {Object.entries(ACCENTS).map(([key, val]) => {
              const color = val[dark ? 'dark' : 'light']
              return (
                <button key={key} onClick={() => setAccent(key)} title={key} style={{
                  width: 26, height: 26, borderRadius: 13, border: accent === key ? `3px solid ${T.onSurface}` : '3px solid transparent',
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
                padding: '5px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit', fontWeight: 650,
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
      </Section>

      {/* Account */}
      <Section label="Compte">
        {user ? (
          <>
            <SettingRow label={user.email || 'Utilisateur'} icon="user">
              <span style={{ fontSize: 12, color: '#4CAF50', fontWeight: 600 }}>Connecté</span>
            </SettingRow>
            <SettingRow label="Se déconnecter" icon="logout">
              <button onClick={signOut} style={{ padding: '6px 14px', borderRadius: 10, border: `1.5px solid #E57373`, background: 'transparent', color: '#E57373', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 650 }}>
                Déconnexion
              </button>
            </SettingRow>
          </>
        ) : (
          <SettingRow label="Non connecté" icon="user">
            <span style={{ fontSize: 12, color: T.onSurfaceVariant }}>Mode local</span>
          </SettingRow>
        )}
      </Section>

      {/* Data */}
      <Section label="Données">
        <SettingRow label="Exporter les données" icon="download">
          <button onClick={handleExport} style={{ padding: '6px 14px', borderRadius: 10, border: `1.5px solid ${A}66`, background: 'transparent', color: A, cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 650 }}>
            JSON
          </button>
        </SettingRow>
        <SettingRow label={`${crises.length} crise${crises.length !== 1 ? 's' : ''} enregistrée${crises.length !== 1 ? 's' : ''}`} icon="database" />
      </Section>

      {/* About */}
      <Section label="À propos">
        <SettingRow label="MigraTrack v2.0" icon="shield">
          <span style={{ fontSize: 12, color: T.onSurfaceVariant }}>PWA</span>
        </SettingRow>
      </Section>
    </div>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  const { T } = useTheme()
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.6, textTransform: 'uppercase', margin: '0 2px 10px' }}>{label}</div>
      <Card pad={0}>
        {children}
      </Card>
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
      background: value ? A : 'rgba(120,120,128,0.3)', transition: 'background .2s', position: 'relative', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: 3, left: value ? 23 : 3, width: 22, height: 22,
        borderRadius: 11, background: '#fff', transition: 'left .2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
      }} />
    </button>
  )
}
