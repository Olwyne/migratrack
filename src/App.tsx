import { useState, useEffect } from 'react'
import { ThemeProvider } from './components/layout/ThemeProvider'
import { AppShell } from './components/layout/AppShell'
import { HomeScreen } from './screens/HomeScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { StatsScreen } from './screens/StatsScreen'
import { ReportScreen } from './screens/ReportScreen'
import { CrisisDetailScreen } from './screens/CrisisDetailScreen'
import { AuthScreen } from './screens/AuthScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { usePrefs } from './store/prefs'
import { useAuth } from './store/auth'
import { useCrisis } from './store/crisis'
import { MigraineCrisis } from './data/types'
import { supabase } from './data/supabase'
import { useTheme } from './hooks/useTheme'

type Tab = 'home' | 'history' | 'stats' | 'report'
type OverlayType = { type: 'detail'; crisis: MigraineCrisis; isNew: boolean } | { type: 'settings' }

function newCrisis(): MigraineCrisis {
  const now = new Date()
  return {
    id: `c_${Date.now()}`,
    start: now, end: null, intensity: 5, location: null,
    symptoms: [], triggers: [], treatments: [],
    intensityHistory: [{ t: now, v: 5 }],
    notes: '', weatherPressure: null, weatherDescription: null,
  }
}

function AppInner() {
  const { T } = useTheme()
  const { onboardingDone } = usePrefs()
  const { session, loading } = useAuth()
  const { saveCrisis, deleteCrisis, setOngoing } = useCrisis()

  const [tab, setTab] = useState<Tab>('home')
  const [stack, setStack] = useState<OverlayType[]>([])
  const [guestMode, setGuestMode] = useState(false)

  useEffect(() => {
    if (session?.user) {
      const { pullFromSupabase } = useCrisis.getState()
      pullFromSupabase(session.user.id)
    }
  }, [session?.user?.id])

  useEffect(() => {
    const onHash = () => { if (window.location.hash === '#guest') setGuestMode(true) }
    window.addEventListener('hashchange', onHash)
    if (window.location.hash === '#guest') setGuestMode(true)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const openCrisis = (c: MigraineCrisis) => setStack(s => [...s, { type: 'detail', crisis: c, isNew: false }])
  const startCrisis = () => setStack(s => [...s, { type: 'detail', crisis: newCrisis(), isNew: true }])
  const closeTop = () => setStack(s => s.slice(0, -1))
  const endOngoing = () => {
    const ongoing = useCrisis.getState().ongoing
    if (ongoing) saveCrisis({ ...ongoing, end: new Date() }, session?.user?.id)
    setOngoing(null)
  }

  const handleSaveCrisis = (c: MigraineCrisis, isNew: boolean) => {
    if (isNew && !c.end) setOngoing(c)
    else if (isNew) setOngoing(null)
    saveCrisis(c, session?.user?.id)
    closeTop()
  }

  const handleUpdateCrisis = (c: MigraineCrisis) => {
    if (!c.end) setOngoing(c)
    saveCrisis(c, session?.user?.id)
  }

  const handleDeleteCrisis = (id: string) => {
    deleteCrisis(id, session?.user?.id)
    closeTop()
  }

  const overlay = stack[stack.length - 1]
  const showFAB = (tab === 'home' || tab === 'history') && !overlay

  if (!onboardingDone) {
    return <OnboardingScreen onDone={() => {}} />
  }

  if (supabase && !loading && !session && !guestMode) {
    return <AuthScreen />
  }

  if (loading && supabase) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", color: T.onSurfaceVariant }}>
        Chargement…
      </div>
    )
  }

  return (
    <AppShell tab={tab} onTabChange={t => { if (overlay?.type === 'settings') setStack([]); setTab(t as Tab) }} onFAB={startCrisis} showFAB={showFAB}>
      {tab === 'home' && <HomeScreen onStartCrisis={startCrisis} onEndCrisis={endOngoing} openCrisis={openCrisis} goStats={() => setTab('stats')} onSettings={() => setStack(s => [...s, { type: 'settings' }])} />}
      {tab === 'history' && <HistoryScreen openCrisis={openCrisis} />}
      {tab === 'stats' && <StatsScreen goReport={() => setTab('report')} />}
      {tab === 'report' && <ReportScreen goBack={() => setTab('stats')} />}

      {overlay && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 40, background: T.bg,
          overflowY: 'auto', overflowX: 'hidden',
          animation: 'slideUp .28s cubic-bezier(.2,.8,.2,1)',
        }}>
          <div style={{ padding: '0 20px', paddingBottom: 40, maxWidth: 480, margin: '0 auto', minHeight: '100%' }}>
            {overlay.type === 'detail' && (
              <CrisisDetailScreen
                crisis={overlay.crisis}
                isNew={overlay.isNew}
                onClose={closeTop}
                onSave={(c) => handleSaveCrisis(c, overlay.isNew)}
                onUpdate={handleUpdateCrisis}
                onDelete={!overlay.isNew ? handleDeleteCrisis : undefined}
              />
            )}
            {overlay.type === 'settings' && (
              <SettingsScreen onClose={closeTop} />
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}
