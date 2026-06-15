import { ReactNode } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { usePrefs, useDensity } from '../../store/prefs'
import { Icon } from '../ui/Icon'

const NAV = [
  { id: 'home', label: 'Accueil', icon: 'home' },
  { id: 'history', label: 'Historique', icon: 'calendar' },
  { id: 'stats', label: 'Stats', icon: 'chart' },
  { id: 'settings', label: 'Paramètres', icon: 'settings' },
]

interface Props {
  tab: string
  onTabChange: (id: string) => void
  onFAB: () => void
  showFAB: boolean
  children: ReactNode
}

export function AppShell({ tab, onTabChange, onFAB, showFAB, children }: Props) {
  const { T, A } = useTheme()
  const { fontScale } = usePrefs()
  const dens = useDensity()
  const pagePad = Math.round(20 * dens)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: T.bg, color: T.onSurface,
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      fontSize: 15 * fontScale,
      display: 'flex', flexDirection: 'column',
      transition: 'background .3s',
    }}>
      {/* Scrollable content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' as never }}>
        <div style={{ padding: pagePad, paddingTop: 14, paddingBottom: 120, maxWidth: 480, margin: '0 auto' }}>
          {children}
        </div>
      </div>

      {/* Bottom nav */}
      <nav style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        background: T.navBg, backdropFilter: 'blur(20px) saturate(160%)',
        borderTop: `1px solid ${T.cardBorder}`,
        paddingBottom: 'env(safe-area-inset-bottom, 8px)',
        display: 'flex', alignItems: 'stretch', zIndex: 50,
      }}>
        {NAV.map(n => {
          const active = tab === n.id
          return (
            <button key={n.id} onClick={() => onTabChange(n.id)} style={{
              flex: 1, border: 'none', background: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '11px 0 10px', fontFamily: 'inherit',
            }}>
              <Icon name={n.icon} size={23} color={active ? A : T.onSurfaceVariant} stroke={active ? 2.3 : 1.9} />
              <span style={{ fontSize: 10.5, fontWeight: active ? 750 : 550, color: active ? A : T.onSurfaceVariant, letterSpacing: 0.1 }}>{n.label}</span>
            </button>
          )
        })}
      </nav>

      {/* FAB */}
      {showFAB && (
        <button onClick={onFAB} aria-label="Enregistrer une crise" style={{
          position: 'fixed', right: 18, bottom: 84, width: 58, height: 58, borderRadius: 19,
          border: 'none', background: A, color: '#fff', cursor: 'pointer', zIndex: 51,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 8px 22px ${A}55`,
        }}>
          <Icon name="plus" size={28} color="#fff" stroke={2.5} />
        </button>
      )}
    </div>
  )
}
