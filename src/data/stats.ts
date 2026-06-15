import { MigraineCrisis, TRIGGERS } from './types'
import { intensityBand } from '../tokens'
import { DAYS_FR, MONTHS_FR } from '../utils/date'

export interface CrisisStats {
  count: number
  thisMonth: number
  thisWeek: number
  avgDur: number | null
  avgInt: number | null
  byDow: number[]
  byHour: number[]
  triggers: { key: string; count: number }[]
  bands: { Légère: number; Modérée: number; Forte: number }
  locations: { key: string; count: number }[]
  treatments: { name: string; avg: number; n: number }[]
}

export interface Insight {
  icon: string
  text: string
}

export function computeStats(list: MigraineCrisis[], now = new Date()): CrisisStats {
  const done = list.filter(c => c.end)
  const monthAgo = new Date(now); monthAgo.setMonth(monthAgo.getMonth() - 1)
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
  const thisMonth = done.filter(c => c.start >= monthAgo).length
  const thisWeek = done.filter(c => c.start >= weekAgo).length
  const durs = done.map(c => (c.end!.getTime() - c.start.getTime()) / 60000)
  const avgDur = durs.length ? Math.round(durs.reduce((a,b) => a+b, 0) / durs.length) : null
  const ints = done.filter(c => c.intensity).map(c => c.intensity)
  const avgInt = ints.length ? ints.reduce((a,b) => a+b, 0) / ints.length : null

  const byDow = [0,0,0,0,0,0,0]
  done.forEach(c => { byDow[(c.start.getDay() + 6) % 7]++ })
  const byHour = Array(8).fill(0) as number[]
  done.forEach(c => { byHour[Math.floor(c.start.getHours() / 3)]++ })

  const trigCount: Record<string, number> = {}
  done.forEach(c => c.triggers.forEach(t => { trigCount[t] = (trigCount[t] || 0) + 1 }))
  const triggers = Object.entries(trigCount).map(([k,v]) => ({ key: k, count: v })).sort((a,b) => b.count - a.count)

  const bands = { Légère: 0, Modérée: 0, Forte: 0 }
  done.forEach(c => { if (c.intensity) bands[intensityBand(c.intensity)]++ })

  const locCount: Record<string, number> = {}
  done.forEach(c => { if (c.location) locCount[c.location] = (locCount[c.location] || 0) + 1 })
  const locations = Object.entries(locCount).map(([k,v]) => ({ key: k, count: v })).sort((a,b) => b.count - a.count)

  const txMap: Record<string, { sum: number; n: number }> = {}
  done.forEach(c => c.treatments.forEach(t => {
    if (!txMap[t.name]) txMap[t.name] = { sum: 0, n: 0 }
    txMap[t.name].sum += t.eff; txMap[t.name].n++
  }))
  const treatments = Object.entries(txMap).map(([name,v]) => ({ name, avg: v.sum/v.n, n: v.n })).sort((a,b) => b.avg - a.avg)

  return { thisMonth, thisWeek, avgDur, avgInt, byDow, byHour, triggers, bands, locations, treatments, count: done.length }
}

export function computeInsights(list: MigraineCrisis[], now = new Date()): Insight[] {
  const s = computeStats(list, now)
  const out: Insight[] = []
  if (s.triggers[0]) out.push({ icon: 'bolt', text: `Votre déclencheur le plus fréquent : ${TRIGGERS[s.triggers[0].key]}` })
  const maxDow = s.byDow.indexOf(Math.max(...s.byDow))
  out.push({ icon: 'calendar', text: `Les crises surviennent souvent le ${DAYS_FR[maxDow]}` })
  const lowP = list.filter(c => c.end && c.weatherPressure && c.weatherPressure < 1008).length
  const pct = s.count > 0 ? Math.round((lowP / s.count) * 100) : 0
  if (pct > 0) out.push({ icon: 'cloud', text: `${pct} % de vos crises ont eu lieu quand la pression était sous 1008 hPa` })
  if (s.avgInt) out.push({ icon: 'pulse', text: `En moyenne intensité ${s.avgInt.toFixed(1)}/10` })
  if (s.locations[0]) out.push({ icon: 'pin', text: `Lieu le plus fréquent : ${s.locations[0].key}` })
  return out
}
