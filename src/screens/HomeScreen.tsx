import { useTheme } from '../hooks/useTheme'
import { usePrefs } from '../store/prefs'
import { useCrisis } from '../store/crisis'
import { MigraineCrisis, TreatmentLog, TRIGGERS } from '../data/types'
import { computeStats } from '../data/stats'
import { SAMPLE_GOALS, SAMPLE_STREAK } from '../data/sample'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { TonalButton, OutlineButton } from '../components/ui/Buttons'
import { IntensityBadge, ProgressBar, SectionTitle, Divider } from '../components/ui/Primitives'
import { capitalize, relDate, longDate, fmtDur, hhmm } from '../utils/date'

interface Props {
  onStartCrisis: () => void
  onEndCrisis: () => void
  openCrisis: (c: MigraineCrisis) => void
  goStats: () => void
}

export function HomeScreen({ onStartCrisis, onEndCrisis, openCrisis, goStats }: Props) {
  const { T, A, dark } = useTheme()
  const { showSteps, showHydration } = usePrefs()
  const { crises, ongoing, logs, markLog, schedules } = useCrisis()
  const now = new Date()
  const stats = computeStats(crises, now)
  const recent = crises.filter(c => c.end).slice(0, 4)
  const monthTop = stats.triggers[0] ? TRIGGERS[stats.triggers[0].key] : null

  // Today's treatments (from schedules + logs)
  const todayStr = now.toISOString().slice(0, 10)
  const todayTreatments = schedules
    .filter(s => s.active)
    .flatMap(s => s.times.map(time => {
      const logEntry = logs.find(l => l.scheduleId === s.id && l.date === todayStr && l.time === time)
      return { id: `${s.id}-${time}`, scheduleId: s.id, time, name: s.name, qty: s.dose, status: logEntry?.taken ? 'taken' : 'pending', takenAt: logEntry?.takenAt ?? null }
    }))
    .sort((a, b) => a.time.localeCompare(b.time))

  const handleTake = (scheduleId: string, time: string) => {
    const h = now.getHours().toString().padStart(2,'0')
    const m = now.getMinutes().toString().padStart(2,'0')
    const log: TreatmentLog = { id: `${scheduleId}-${todayStr}-${time}`, scheduleId, date: todayStr, time, taken: true, takenAt: `${h}:${m}` }
    markLog(log)
  }
  const handleSkip = (scheduleId: string, time: string) => {
    const log: TreatmentLog = { id: `${scheduleId}-${todayStr}-${time}`, scheduleId, date: todayStr, time, taken: false, takenAt: null }
    markLog(log)
  }

  return (
    <div>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fff', boxShadow: '0 1px 3px rgba(28,27,34,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'visible' }}>
            <img src="/logo.png" alt="MigraTrack" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 10 }} />
          </div>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: T.onSurface, letterSpacing: -0.3, lineHeight: 1 }}>MigraTrack</div>
            <div style={{ fontSize: 11.5, color: T.onSurfaceVariant, marginTop: 3 }}>{capitalize(longDate(now))}</div>
          </div>
        </div>
        <div style={{ width: 40 }} />
      </div>

      {/* Hero */}
      {!ongoing ? (
        <button onClick={onStartCrisis} style={{
          display: 'flex', alignItems: 'center', gap: 15, width: '100%', border: 'none', cursor: 'pointer',
          background: A, color: '#fff', borderRadius: 18, padding: '20px 22px', textAlign: 'left',
          fontFamily: 'inherit', boxShadow: `0 8px 22px ${A}40`, transition: 'transform .12s',
        }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.99)' }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}>
          <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="shield" size={26} color="#fff" stroke={2.1} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 750, letterSpacing: 0.1 }}>J'ai mal à la tête</div>
            <div style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, marginTop: 2 }}>Démarrer le suivi d'une crise</div>
          </div>
          <Icon name="chevronR" size={20} color="#fff" stroke={2.4} style={{ opacity: 0.8 }} />
        </button>
      ) : (
        <OngoingCard ongoing={ongoing} onEnd={onEndCrisis} openCrisis={openCrisis} />
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
        <Card pad={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="flame" size={18} color={A} fill={A} stroke={0} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.2 }}>JOURS SANS CRISE</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 34, fontWeight: 820, color: T.onSurface, lineHeight: 1 }}>{SAMPLE_STREAK.current}</span>
            <span style={{ fontSize: 14, color: T.onSurfaceVariant, fontWeight: 600 }}>jours</span>
          </div>
          <div style={{ fontSize: 11.5, color: T.onSurfaceVariant, marginTop: 6 }}>Meilleure série : {SAMPLE_STREAK.best} jours</div>
        </Card>
        <Card pad={16}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <Icon name="calendar" size={17} color={A} stroke={2} />
            <span style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.2 }}>CE MOIS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 34, fontWeight: 820, color: T.onSurface, lineHeight: 1 }}>{stats.thisMonth}</span>
            <span style={{ fontSize: 14, color: T.onSurfaceVariant, fontWeight: 600 }}>crise{stats.thisMonth !== 1 ? 's' : ''}</span>
          </div>
          <div style={{ fontSize: 11.5, color: T.onSurfaceVariant, marginTop: 6 }}>Intensité moy. {stats.avgInt ? stats.avgInt.toFixed(1) : '—'}/10</div>
        </Card>
      </div>

      {/* Weekly summary */}
      <Card style={{ marginTop: 12 }} pad={16}>
        <div style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.2, marginBottom: 10 }}>RÉSUMÉ DU MOIS</div>
        <div style={{ display: 'flex', gap: 18 }}>
          <SummaryStat value={`${stats.thisMonth}`} label="crises" />
          <Divider />
          <SummaryStat value={fmtDur(stats.avgDur)} label="durée moy." />
          <Divider />
          <SummaryStat value={monthTop || '—'} label="déclencheur" />
        </div>
      </Card>

      {/* Goals */}
      {(showSteps || showHydration) && (
        <Card style={{ marginTop: 12 }} pad={16}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.2, marginBottom: 14 }}>OBJECTIFS DU JOUR</div>
          {showSteps && <GoalRow icon="steps" label="Pas" cur={SAMPLE_GOALS.stepsToday} target={SAMPLE_GOALS.stepsTarget} fmt={v => v.toLocaleString('fr-FR')} color="#7AA88A" />}
          {showSteps && showHydration && <div style={{ height: 14 }} />}
          {showHydration && <GoalRow icon="drop" label="Hydratation" cur={SAMPLE_GOALS.waterToday} target={SAMPLE_GOALS.waterTarget} fmt={v => `${v.toFixed(1)} L`} color="#6E9BC4" />}
        </Card>
      )}

      {/* Today treatments */}
      {todayTreatments.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <SectionTitle>Aujourd'hui</SectionTitle>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {todayTreatments.map(t => (
              <TreatmentTile key={t.id} t={t}
                onTake={() => handleTake(t.scheduleId, t.time)}
                onSkip={() => handleSkip(t.scheduleId, t.time)} />
            ))}
          </div>
        </div>
      )}

      {/* Recent crises */}
      <div style={{ marginTop: 24 }}>
        <SectionTitle>Crises récentes</SectionTitle>
        {recent.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: T.onSurfaceVariant, fontSize: 14 }}>Aucune crise enregistrée 🌿</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {recent.map(c => <CrisisRow key={c.id} crisis={c} onClick={() => openCrisis(c)} />)}
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryStat({ value, label }: { value: string; label: string }) {
  const { T } = useTheme()
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 17, fontWeight: 800, color: T.onSurface, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{value}</div>
      <div style={{ fontSize: 11.5, color: T.onSurfaceVariant, marginTop: 3 }}>{label}</div>
    </div>
  )
}

function GoalRow({ icon, label, cur, target, fmt, color }: { icon: string; label: string; cur: number; target: number; fmt: (v: number) => string; color: string }) {
  const { T } = useTheme()
  const pct = Math.min(1, cur / target)
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name={icon} size={16} color={color} stroke={2} />
          <span style={{ fontSize: 13.5, fontWeight: 600, color: T.onSurface }}>{label}</span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 700, color: T.onSurfaceVariant, fontVariantNumeric: 'tabular-nums' }}>{fmt(cur)} / {fmt(target)}</span>
      </div>
      <ProgressBar value={pct} color={color} height={6} />
    </div>
  )
}

function OngoingCard({ ongoing, onEnd, openCrisis }: { ongoing: MigraineCrisis; onEnd: () => void; openCrisis: (c: MigraineCrisis) => void }) {
  const { T, A, dark } = useTheme()
  const mins = Math.round((new Date().getTime() - ongoing.start.getTime()) / 60000)
  return (
    <Card pad={18} style={{ border: `1.5px solid ${A}`, background: dark ? A + '1F' : A + '10' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 4 }}>
        <span style={{ position: 'relative', width: 10, height: 10 }}>
          <span style={{ position: 'absolute', inset: 0, borderRadius: 10, background: A, animation: 'pulseDot 1.6s ease-out infinite' }} />
          <span style={{ position: 'absolute', inset: 0, borderRadius: 10, background: A }} />
        </span>
        <span style={{ fontSize: 16, fontWeight: 800, color: A }}>Crise en cours</span>
        <span style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600, color: T.onSurfaceVariant }}>depuis {fmtDur(mins)}</span>
      </div>
      <div style={{ fontSize: 13, color: T.onSurfaceVariant, margin: '8px 0 16px' }}>
        Intensité actuelle {ongoing.intensity}/10 · {ongoing.location}
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <TonalButton icon="check" onClick={onEnd}>Terminer la crise</TonalButton>
        <OutlineButton icon="edit" onClick={() => openCrisis(ongoing)}>Modifier</OutlineButton>
      </div>
    </Card>
  )
}

function TreatmentTile({ t, onTake, onSkip }: { t: { time: string; name: string; qty: string; status: string; takenAt: string | null }; onTake: () => void; onSkip: () => void }) {
  const { T, A, dark } = useTheme()
  const done = t.status === 'taken', skipped = t.status === 'skipped'
  return (
    <Card pad={14}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: done ? '#4CAF5020' : skipped ? T.outline : A + (dark ? '26' : '14'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name={done ? 'check' : 'pill'} size={20} color={done ? '#4CAF50' : skipped ? T.onSurfaceVariant : A} stroke={2.1} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 600, color: T.onSurface, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span style={{ fontWeight: 700 }}>{t.time}</span>{' '}{t.name}
          </div>
          <div style={{ fontSize: 12.5, color: T.onSurfaceVariant, marginTop: 2 }}>
            {t.qty}{done ? ` · Pris à ${t.takenAt}` : skipped ? ' · Ignoré' : ''}
          </div>
        </div>
        {!done && !skipped && (
          <div style={{ display: 'flex', gap: 7 }}>
            <button onClick={onSkip} style={{ padding: '7px 12px', borderRadius: 10, border: `1.5px solid ${T.outline}`, background: 'transparent', color: T.onSurfaceVariant, fontSize: 12.5, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}>Ignorer</button>
            <button onClick={onTake} style={{ padding: '7px 13px', borderRadius: 10, border: 'none', background: A, color: '#fff', fontSize: 12.5, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="check" size={14} color="#fff" stroke={2.6} />Pris
            </button>
          </div>
        )}
      </div>
    </Card>
  )
}

export function CrisisRow({ crisis, onClick }: { crisis: MigraineCrisis; onClick: () => void }) {
  const { T } = useTheme()
  const dur = crisis.end ? Math.round((crisis.end.getTime() - crisis.start.getTime()) / 60000) : null
  return (
    <Card pad={13} onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
        {crisis.intensity
          ? <IntensityBadge level={crisis.intensity} size={44} />
          : <div style={{ width: 44, height: 44, borderRadius: 14, background: T.outline, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="pulse" size={20} color={T.onSurfaceVariant} /></div>}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: T.onSurface }}>{capitalize(relDate(crisis.start))}</div>
          <div style={{ fontSize: 12.5, color: T.onSurfaceVariant, marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {crisis.location}{dur != null ? ` · ${fmtDur(dur)}` : ''}{crisis.triggers.length ? ` · ${TRIGGERS[crisis.triggers[0]]}` : ''}
          </div>
        </div>
        <Icon name="chevronR" size={18} color={T.onSurfaceVariant} stroke={2} />
      </div>
    </Card>
  )
}
