import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useCrisis } from '../store/crisis'
import { computeStats } from '../data/stats'
import { TRIGGERS, SYMPTOMS } from '../data/types'
import { Card } from '../components/ui/Card'
import { Icon } from '../components/ui/Icon'
import { PrimaryButton, OutlineButton, IconButton } from '../components/ui/Buttons'
import { capitalize, longDate, MONTHS_FR, hhmm, fmtDur } from '../utils/date'
import { intensityColor } from '../tokens'

interface Props { goBack: () => void }

const PERIODS = {
  '1m': { label: 'Dernier mois', days: 30 },
  '3m': { label: '3 derniers mois', days: 92 },
  'all': { label: 'Tout', days: 9999 },
} as const

type PeriodKey = keyof typeof PERIODS

export function ReportScreen({ goBack }: Props) {
  const { T, A, dark } = useTheme()
  const { crises } = useCrisis()
  const [period, setPeriod] = useState<PeriodKey>('3m')
  const now = new Date()

  const cutoff = new Date(now)
  cutoff.setDate(cutoff.getDate() - PERIODS[period].days)
  const list = crises.filter(c => c.end && c.start >= cutoff).sort((a, b) => b.start.getTime() - a.start.getTime())
  const stats = computeStats(list, now)
  const topTrigs = stats.triggers.slice(0, 3)

  const handlePrint = () => window.print()
  const handleExportCSV = () => {
    const rows = [
      ['Date','Heure début','Heure fin','Durée (min)','Intensité','Localisation','Déclencheurs','Symptômes','Traitements','Notes'],
      ...list.map(c => [
        c.start.toLocaleDateString('fr-FR'),
        hhmm(c.start),
        c.end ? hhmm(c.end!) : '',
        c.end ? Math.round((c.end!.getTime() - c.start.getTime()) / 60000).toString() : '',
        c.intensity.toString(),
        c.locations?.join(', ') ?? '',
        c.triggers.map(t => TRIGGERS[t] || t).join('; '),
        c.symptoms.map(s => SYMPTOMS[s] || s).join('; '),
        c.treatments.map(t => t.name).join('; '),
        c.notes,
      ])
    ]
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'migratrack-rapport.csv'; a.click()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <IconButton icon="chevronL" onClick={goBack} />
        <h1 style={{ fontSize: 22, fontWeight: 820, color: T.onSurface, margin: 0, letterSpacing: -0.4 }}>Rapport médecin</h1>
      </div>

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, background: T.cardTint, borderRadius: 12, padding: 4, marginBottom: 18 }}>
        {(Object.entries(PERIODS) as [PeriodKey, { label: string }][]).map(([k, v]) => (
          <button key={k} onClick={() => setPeriod(k)} style={{
            flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer',
            background: period === k ? T.card : 'transparent',
            color: period === k ? T.onSurface : T.onSurfaceVariant,
            fontFamily: 'inherit', fontSize: 12.5, fontWeight: 650,
            boxShadow: period === k ? T.shadow : 'none', transition: 'all .15s',
          }}>{v.label}</button>
        ))}
      </div>

      {/* Document card */}
      <Card pad={0} style={{ overflow: 'hidden' }}>
        {/* Letterhead */}
        <div style={{ padding: 20, background: A, color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, overflow: 'hidden', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="/logo.png" alt="MigraTrack" style={{ width: '128%', height: '128%', objectFit: 'cover' }} />
            </div>
            <span style={{ fontSize: 15, fontWeight: 800 }}>MigraTrack</span>
            <span style={{ marginLeft: 'auto', fontSize: 11.5, opacity: 0.85 }}>{capitalize(longDate(now))}</span>
          </div>
          <div style={{ fontSize: 19, fontWeight: 800 }}>Journal des migraines</div>
          <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 3 }}>Patient · Période : {PERIODS[period].label.toLowerCase()}</div>
        </div>

        {/* Key figures */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: `1px solid ${T.outline}` }}>
          <RepFig value={stats.count} label="crises" border T={T} />
          <RepFig value={stats.avgInt ? stats.avgInt.toFixed(1) : '—'} label="intensité moy." border T={T} />
          <RepFig value={fmtDur(stats.avgDur)} label="durée moy." T={T} />
        </div>

        {/* Top triggers */}
        {topTrigs.length > 0 && (
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.outline}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.3, marginBottom: 10 }}>DÉCLENCHEURS FRÉQUENTS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {topTrigs.map((t, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 9999, background: T.cardTint, fontSize: 12.5, fontWeight: 600, color: T.onSurface }}>
                  {TRIGGERS[t.key] || t.key} <b style={{ color: A }}>{t.count}×</b>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Treatments */}
        {stats.treatments.length > 0 && (
          <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.outline}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.3, marginBottom: 10 }}>TRAITEMENTS & EFFICACITÉ</div>
            {stats.treatments.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 0' }}>
                <span style={{ fontSize: 13.5, color: T.onSurface, fontWeight: 600 }}>{t.name}</span>
                <span style={{ display: 'flex', gap: 3 }}>
                  {[1,2,3,4,5].map(s => <span key={s} style={{ width: 14, height: 6, borderRadius: 3, background: s <= Math.round(t.avg) ? A : T.outline }} />)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Crisis log */}
        <div style={{ padding: '16px 20px 8px' }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: T.onSurfaceVariant, letterSpacing: 0.3, marginBottom: 4 }}>DÉTAIL DES CRISES</div>
        </div>
        {list.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: T.onSurfaceVariant, fontSize: 14 }}>Aucune crise sur cette période</div>
        ) : list.map((c) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 20px', borderTop: `1px solid ${T.outline}` }}>
            <div style={{ width: 28, textAlign: 'center', fontSize: 13, fontWeight: 800, color: intensityColor(c.intensity || 5), fontVariantNumeric: 'tabular-nums' }}>{c.intensity || '—'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 650, color: T.onSurface }}>{c.start.getDate()} {MONTHS_FR[c.start.getMonth()].slice(0,4)}. · {hhmm(c.start)}</div>
              <div style={{ fontSize: 11.5, color: T.onSurfaceVariant, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {c.locations?.join(', ') ?? ''} · {fmtDur(Math.round((c.end!.getTime() - c.start.getTime()) / 60000))}
                {c.symptoms.length ? ` · ${c.symptoms.map(s => SYMPTOMS[s]).slice(0,2).join(', ')}` : ''}
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Export */}
      <div style={{ display: 'flex', gap: 11, marginTop: 18 }}>
        <PrimaryButton icon="download" onClick={handlePrint}>Exporter en PDF</PrimaryButton>
        <OutlineButton icon="doc" onClick={handleExportCSV} style={{ width: 'auto', padding: '12px 18px', whiteSpace: 'nowrap' }}>CSV</OutlineButton>
      </div>
      <div style={{ fontSize: 11.5, color: T.onSurfaceVariant, textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        Le rapport est généré localement et partagé uniquement avec votre accord.
      </div>
    </div>
  )
}

function RepFig({ value, label, border, T }: { value: number | string; label: string; border?: boolean; T: { onSurface: string; onSurfaceVariant: string; outline: string } }) {
  return (
    <div style={{ padding: '16px 8px', textAlign: 'center', borderRight: border ? `1px solid ${T.outline}` : 'none' }}>
      <div style={{ fontSize: 22, fontWeight: 820, color: T.onSurface, letterSpacing: -0.5 }}>{value}</div>
      <div style={{ fontSize: 11, color: T.onSurfaceVariant, marginTop: 3 }}>{label}</div>
    </div>
  )
}
