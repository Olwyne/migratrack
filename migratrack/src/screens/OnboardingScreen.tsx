import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { usePrefs } from '../store/prefs'
import { PrimaryButton } from '../components/ui/Buttons'
import { Icon } from '../components/ui/Icon'

const STEPS = [
  {
    icon: 'shield',
    title: 'Suivez vos migraines',
    body: 'Enregistrez chaque crise en quelques secondes — intensité, localisation, symptômes, déclencheurs et traitements.',
  },
  {
    icon: 'chart',
    title: 'Découvrez vos tendances',
    body: 'Visualisez vos statistiques : jours les plus touchés, déclencheurs fréquents, efficacité de vos traitements.',
  },
  {
    icon: 'report',
    title: 'Partagez avec votre médecin',
    body: 'Générez un rapport clair et professionnel à présenter lors de votre prochaine consultation.',
  },
]

interface Props { onDone: () => void }

export function OnboardingScreen({ onDone }: Props) {
  const { T, A, dark } = useTheme()
  const { setOnboardingDone } = usePrefs()
  const [step, setStep] = useState(0)

  const isLast = step === STEPS.length - 1
  const s = STEPS[step]

  const next = () => {
    if (isLast) { setOnboardingDone(true); onDone() }
    else setStep(s => s + 1)
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '32px 28px',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: T.onSurface,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 56 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 6px rgba(28,27,34,0.12)' }}>
          <img src="/logo.png" alt="MigraTrack" style={{ width: '128%', height: '128%', objectFit: 'cover' }} />
        </div>
        <span style={{ fontSize: 22, fontWeight: 800, color: T.onSurface, letterSpacing: -0.3 }}>MigraTrack</span>
      </div>

      {/* Icon */}
      <div style={{ width: 96, height: 96, borderRadius: 28, background: A + (dark ? '26' : '18'), display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 36 }}>
        <Icon name={s.icon} size={48} color={A} stroke={1.8} />
      </div>

      {/* Content */}
      <h1 style={{ fontSize: 26, fontWeight: 820, color: T.onSurface, textAlign: 'center', margin: '0 0 14px', letterSpacing: -0.4 }}>{s.title}</h1>
      <p style={{ fontSize: 15.5, color: T.onSurfaceVariant, textAlign: 'center', lineHeight: 1.55, margin: '0 0 48px', maxWidth: 320 }}>{s.body}</p>

      {/* Dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 40 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, background: i === step ? A : T.outline, transition: 'all .3s' }} />
        ))}
      </div>

      <div style={{ width: '100%', maxWidth: 360 }}>
        <PrimaryButton onClick={next} big>
          {isLast ? 'Commencer' : 'Suivant'}
        </PrimaryButton>
        {!isLast && (
          <button onClick={() => { setOnboardingDone(true); onDone() }} style={{
            display: 'block', width: '100%', marginTop: 16, border: 'none', background: 'transparent',
            color: T.onSurfaceVariant, fontFamily: 'inherit', fontSize: 13.5, cursor: 'pointer',
          }}>Passer</button>
        )}
      </div>
    </div>
  )
}
