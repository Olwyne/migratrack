import { useTheme } from '../hooks/useTheme'
import { useCrisis } from '../store/crisis'
import { computeStats, computeInsights } from '../data/stats'
import { TRIGGERS } from '../data/types'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { PrimaryButton } from '../components/ui/Buttons'
import { ProgressBar, SectionTitle } from '../components/ui/Primitives'
import { BarChart } from '../components/charts/BarChart'
import { Donut } from '../components/charts/Donut'
import { fmtDur } from '../utils/date'
import { CAT_PALETTE } from '../tokens'

const HOUR_LABELS = ['0h','3h','6h','9h','12h','15h','18h','21h']

interface Props { goReport: () => void }

export function StatsScreen({ goReport }: Props) {
  const { T, A, dark } = useTheme()
  const { crises } = useCrisis()
  const stats = computeStats(crises)
  const insights = computeInsights(crises)

  const intSegments = [
    { label: 'Légère (1-3)', value: stats.bands['Légère'], color: '#7CB58A' },
    { label: 'Modérée (4-6)', value: stats.bands['Modérée'], color: '#E6C260' },
    { label: 'Forte (7-10)', value: stats.bands['Forte'], color: '#E08A82' },
  ]
  const trigSegments = stats.triggers.map((t, i) => ({
    label: TRIGGERS[t.key] || t.key, value: t.count, color: CAT_PALETTE[i % CAT_PALETTE.length], count: t.count,
  }))

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 820, color: T.onSurface, margin: '4px 2px 18px', letterSpacing: -0.5 }}>Statistiques</h1>

      {/* Key figures */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <StatTile icon="calendar" label="Crises ce mois" value={stats.thisMonth} />
        <StatTile icon="clock" label="Durée moyenne" value={fmtDur(stats.avgDur)} small />
        <StatTile icon="pulse" label="Intensité moy." value={stats.avgInt ? `${stats.avgInt.toFixed(1)}` : '—'} suffix="/10" />
        <StatTile icon="flame" label="Total enregistré" value={stats.count} />
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <SectionTitle>Tendances</SectionTitle>
          <Card pad={6}>
            {insights.map((ins, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '12px 12px', borderBottom: i < insights.length - 1 ? `1px solid ${T.outline}` : 'none' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: A + (dark ? '24' : '14'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name={ins.icon} size={17} color={A} stroke={2} />
                </div>
                <span style={{ fontSize: 13.5, color: T.onSurface, lineHeight: 1.35, fontWeight: 500 }}>{ins.text}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {/* Day of week */}
      <ChartSection title="Jours avec le plus de crises">
        <BarChart data={stats.byDow} labels={['L','M','M','J','V','S','D']} height={170} />
      </ChartSection>

      {/* By hour */}
      <ChartSection title="Heures de début des crises">
        <BarChart data={stats.byHour} labels={HOUR_LABELS} height={170} />
      </ChartSection>

      {/* Triggers donut */}
      {trigSegments.length > 0 && (
        <ChartSection title="Répartition des déclencheurs">
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <Donut segments={trigSegments} size={150} thickness={24} centerLabel={stats.triggers.reduce((s, t) => s + t.count, 0)} centerSub="déclench." />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
              {trigSegments.map((s, i) => <LegendRow key={i} color={s.color} label={s.label} value={`${s.count}×`} />)}
            </div>
          </div>
        </ChartSection>
      )}

      {/* Intensity distribution */}
      <ChartSection title="Répartition des intensités">
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <Donut segments={intSegments} size={150} thickness={24} centerLabel={intSegments.reduce((s, x) => s + x.value, 0)} centerSub="crises" />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
            {intSegments.map((s, i) => <LegendRow key={i} color={s.color} label={s.label} value={`${s.value}`} />)}
          </div>
        </div>
      </ChartSection>

      {/* Locations */}
      {stats.locations.length > 0 && (
        <ChartSection title="Lieux de la douleur">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {stats.locations.map((l, i) => {
              const pct = l.count / stats.locations[0].count
              return (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13.5, color: T.onSurface, fontWeight: 600 }}>{l.key}</span>
                    <span style={{ fontSize: 13, color: T.onSurfaceVariant, fontWeight: 700 }}>{l.count}×</span>
                  </div>
                  <ProgressBar value={pct} color={CAT_PALETTE[i % CAT_PALETTE.length]} height={7} />
                </div>
              )
            })}
          </div>
        </ChartSection>
      )}

      {/* Treatment effectiveness */}
      {stats.treatments.length > 0 && (
        <ChartSection title="Efficacité des traitements">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {stats.treatments.map((t, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 14, color: T.onSurface, fontWeight: 650 }}>{t.name}</span>
                  <span style={{ fontSize: 13, color: T.onSurfaceVariant }}><b style={{ color: T.onSurface }}>{t.avg.toFixed(1)}</b>/5 · {t.n}×</span>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3,4,5].map(s => (
                    <div key={s} style={{ flex: 1, height: 7, borderRadius: 4, background: s <= Math.round(t.avg) ? A : T.outline }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ChartSection>
      )}

      {/* Rapport CTA */}
      <Card style={{ marginTop: 24, background: dark ? A + '1A' : A + '0D', border: `1px solid ${A}33` }} pad={18}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 13, marginBottom: 14 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: A + (dark ? '2A' : '18'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="doc" size={21} color={A} stroke={1.9} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 750, color: T.onSurface }}>Rapport pour le médecin</div>
            <div style={{ fontSize: 12.5, color: T.onSurfaceVariant, marginTop: 2 }}>Synthèse claire à partager en consultation</div>
          </div>
        </div>
        <PrimaryButton icon="share" onClick={goReport}>Créer le rapport</PrimaryButton>
      </Card>
    </div>
  )
}

function StatTile({ icon, label, value, suffix, small }: { icon: string; label: string; value: number | string; suffix?: string; small?: boolean }) {
  const { T, A } = useTheme()
  return (
    <Card pad={16}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <Icon name={icon} size={16} color={A} stroke={2} />
        <span style={{ fontSize: 11.5, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.2 }}>{label.toUpperCase()}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
        <span style={{ fontSize: small ? 24 : 32, fontWeight: 820, color: T.onSurface, lineHeight: 1, letterSpacing: -0.5 }}>{value}</span>
        {suffix && <span style={{ fontSize: 14, color: T.onSurfaceVariant, fontWeight: 600 }}>{suffix}</span>}
      </div>
    </Card>
  )
}

function ChartSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 24 }}>
      <SectionTitle>{title}</SectionTitle>
      <Card pad={18}>{children}</Card>
    </div>
  )
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  const { T } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <span style={{ width: 11, height: 11, borderRadius: 4, background: color, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 13, color: T.onSurface, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      <span style={{ fontSize: 12.5, fontWeight: 700, color: T.onSurfaceVariant }}>{value}</span>
    </div>
  )
}
