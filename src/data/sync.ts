import { supabase } from './supabase'
import { MigraineCrisis, TreatmentEntry, IntensityEntry, TreatmentSchedule } from './types'

// ── Schedules ────────────────────────────────────────────────────────────────

export async function pullSchedules(userId: string): Promise<TreatmentSchedule[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('treatment_schedules')
    .select('id, data')
    .eq('user_id', userId)
  if (error || !data) return []
  return data.map(row => ({ ...(row.data as object), id: row.id }) as TreatmentSchedule)
}

export async function pushSchedule(s: TreatmentSchedule, userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('treatment_schedules').upsert({
    id: s.id, user_id: userId, data: s, updated_at: new Date().toISOString(),
  })
}

export async function deleteScheduleRemote(id: string, userId: string): Promise<void> {
  if (!supabase) return
  await supabase.from('treatment_schedules').delete().eq('id', id).eq('user_id', userId)
}

// ── User lists (custom symptoms / triggers) ───────────────────────────────────

export async function pullUserLists(userId: string): Promise<{ symptoms: { key: string; label: string }[]; triggers: { key: string; label: string }[] }> {
  if (!supabase) return { symptoms: [], triggers: [] }
  const { data, error } = await supabase
    .from('user_lists')
    .select('list_type, items')
    .eq('user_id', userId)
    .in('list_type', ['symptoms', 'triggers'])
  if (error || !data) return { symptoms: [], triggers: [] }
  const symptoms = (data.find(r => r.list_type === 'symptoms')?.items ?? []) as { key: string; label: string }[]
  const triggers = (data.find(r => r.list_type === 'triggers')?.items ?? []) as { key: string; label: string }[]
  return { symptoms, triggers }
}

export async function pushUserList(userId: string, listType: 'symptoms' | 'triggers', items: { key: string; label: string }[]): Promise<void> {
  if (!supabase) return
  await supabase.from('user_lists').upsert({
    user_id: userId, list_type: listType, items, updated_at: new Date().toISOString(),
  })
}

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
