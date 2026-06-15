import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { supabase } from '../data/supabase'
import { PrimaryButton } from '../components/ui/Buttons'
import { Icon } from '../components/ui/Icon'

export function AuthScreen() {
  const { T, A } = useTheme()
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setSuccess(null); setLoading(true)
    try {
      if (!supabase) throw new Error('Supabase non configuré')
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setSuccess('Compte créé ! Vérifiez vos emails pour confirmer.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px', borderRadius: 14,
    border: `1.5px solid ${T.fieldBorder}`, background: T.field,
    color: T.onSurface, fontFamily: 'inherit', fontSize: 15,
    outline: 'none', boxSizing: 'border-box' as const, transition: 'border-color .2s',
  }

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '32px 24px',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", color: T.onSurface,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 40 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 2px 8px rgba(28,27,34,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src="/logo.png" alt="MigraTrack" style={{ width: '128%', height: '128%', objectFit: 'cover' }} />
        </div>
        <div>
          <div style={{ fontSize: 26, fontWeight: 800, color: T.onSurface, letterSpacing: -0.4 }}>MigraTrack</div>
          <div style={{ fontSize: 13, color: T.onSurfaceVariant, marginTop: 2 }}>Suivi des migraines</div>
        </div>
      </div>

      {/* Card */}
      <div style={{ width: '100%', maxWidth: 400, background: T.card, borderRadius: 20, border: `1px solid ${T.cardBorder}`, padding: 28, boxSizing: 'border-box' }}>
        {/* Tab toggle */}
        <div style={{ display: 'flex', gap: 6, background: T.cardTint, borderRadius: 12, padding: 4, marginBottom: 28 }}>
          {(['login', 'signup'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(null); setSuccess(null) }} style={{
              flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: mode === m ? T.card : 'transparent',
              color: mode === m ? T.onSurface : T.onSurfaceVariant,
              fontFamily: 'inherit', fontSize: 13.5, fontWeight: 650,
              boxShadow: mode === m ? T.shadow : 'none', transition: 'all .15s',
            }}>{m === 'login' ? 'Connexion' : 'Inscription'}</button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.3, display: 'block', marginBottom: 8 }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoComplete="email" placeholder="votre@email.com"
              style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 12.5, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.3, display: 'block', marginBottom: 8 }}>MOT DE PASSE</label>
            <div style={{ position: 'relative' }}>
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                required autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="••••••••" minLength={6}
                style={{ ...inputStyle, paddingRight: 46 }} />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                border: 'none', background: 'transparent', cursor: 'pointer', padding: 4,
              }}>
                <Icon name={showPw ? 'eyeOff' : 'eye'} size={18} color={T.onSurfaceVariant} />
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: '#FEECEC', border: '1px solid #E57373', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#B71C1C' }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{ background: '#E8F5E9', border: '1px solid #4CAF50', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#1B5E20' }}>
              {success}
            </div>
          )}

          <PrimaryButton type="submit" disabled={loading} style={{ marginTop: 6 }}>
            {loading ? 'Chargement…' : mode === 'login' ? 'Se connecter' : 'Créer un compte'}
          </PrimaryButton>
        </form>

        {/* Guest mode */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <button onClick={() => window.location.hash = '#guest'} style={{
            border: 'none', background: 'transparent', color: T.onSurfaceVariant,
            fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline',
          }}>
            Continuer sans compte (données locales)
          </button>
        </div>
      </div>
    </div>
  )
}
