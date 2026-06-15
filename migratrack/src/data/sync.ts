import { supabase } from './supabase'
import { MigraineCrisis, TreatmentEntry, IntensityEntry } from './types'

function serializeCrisis(c: MigraineCrisis) {
  return {
    ...c,
    start: c.start.toISOString(),
    end: c.end ? c.end.toISOString() : null,
    treatments: c.treatments.map(t => ({ ...t, takenAt: t.takenAt ? t.takenAt.toISOString() : null })),
    intensityHistory: c.intensityHistory.map(h => ({ ...h, t: h.t.toISOString() })),
  }
}

function deserializeCrisis(row: Record<string, unknown>): MigraineCrisis {
  const d = row.data as Record<string, unknown>
  return {
    ...(d as Omit<MigraineCrisis, 'start'|'end'|'treatments'|'intensityHistory'>),
    id: row.id as string,
    start: new Date(d.start as string),
    end: d.end ? new Date(d.end as string) : null,
    treatments: ((d.treatments as unknown[]) || []).map((t: unknown) => {
      const tx = t as Record<string, unknown>
      return { ...tx, takenAt: tx.takenAt ? new Date(tx.takenAt as string) : null } as TreatmentEntry
    }),
    intensityHistory: ((d.intensityHistory as unknown[]) || []).map((h: unknown) => {
      const hi = h as Record<string, unknown>
      return { t: new Date(hi.t as string), v: hi.v as number } as IntensityEntry
    }),
  }
}

export async function pullCrises(userId: string): Promise<MigraineCrisis[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('crises')
    .select('id, data, updated_at')
    .eq('user_id', userId)
  if (error || !data) return []
  return data.map(row => deserializeCrisis(row as Record<string, unknown>))
}

export async function pushCrisis(crisis: MigraineCrisis, userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('crises').upsert({
    id: crisis.id,
    user_id: userId,
    data: serializeCrisis(crisis),
    updated_at: new Date().toISOString(),
  })
}

export async function deleteCrisisRemote(id: string, userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('crises').delete().eq('id', id).eq('user_id', userId)
}
