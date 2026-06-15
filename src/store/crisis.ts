import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MigraineCrisis, TreatmentSchedule, TreatmentLog } from '../data/types'
import { SAMPLE_CRISES, SAMPLE_SCHEDULES, SAMPLE_LOGS } from '../data/sample'
import { pullCrises, pushCrisis, deleteCrisisRemote, pullSchedules, pushSchedule, deleteScheduleRemote, pullUserLists, pushUserList, pullLogs, pushLog } from '../data/sync'

export interface CustomItem { key: string; label: string }

interface CrisisState {
  crises: MigraineCrisis[]
  ongoing: MigraineCrisis | null
  schedules: TreatmentSchedule[]
  logs: TreatmentLog[]
  usingSampleData: boolean
  customSymptoms: CustomItem[]
  customTriggers: CustomItem[]
  // Crisis CRUD
  saveCrisis: (c: MigraineCrisis, userId?: string) => void
  deleteCrisis: (id: string, userId?: string) => void
  setOngoing: (c: MigraineCrisis | null) => void
  // Sync
  pullFromSupabase: (userId: string) => Promise<void>
  // Schedules
  saveSchedule: (s: TreatmentSchedule, userId?: string) => void
  deleteSchedule: (id: string, userId?: string) => void
  // Logs
  markLog: (log: TreatmentLog, userId?: string) => void
  // Custom items
  saveCustomSymptom: (item: CustomItem, userId?: string) => void
  deleteCustomSymptom: (key: string, userId?: string) => void
  saveCustomTrigger: (item: CustomItem, userId?: string) => void
  deleteCustomTrigger: (key: string, userId?: string) => void
}

// Revive dates after persist (JSON serialization flattens Date → string)
function reviveCrisis(c: MigraineCrisis): MigraineCrisis {
  return {
    ...c,
    start: new Date(c.start),
    end: c.end ? new Date(c.end) : null,
    treatments: c.treatments.map(t => ({ ...t, takenAt: t.takenAt ? new Date(t.takenAt) : null })),
    intensityHistory: c.intensityHistory.map(h => ({ t: new Date(h.t), v: h.v })),
  }
}

export const useCrisis = create<CrisisState>()(
  persist(
    (set, get) => ({
      crises: SAMPLE_CRISES,
      ongoing: null,
      schedules: SAMPLE_SCHEDULES,
      logs: SAMPLE_LOGS,
      usingSampleData: true,
      customSymptoms: [],
      customTriggers: [],

      saveCrisis: (c, userId) => {
        const crises = get().crises.filter(x => x.id !== c.id)
        set({ crises: [c, ...crises] })
        if (userId) pushCrisis(c, userId)
      },

      deleteCrisis: (id, userId) => {
        set({ crises: get().crises.filter(c => c.id !== id) })
        if (userId) deleteCrisisRemote(id, userId)
      },

      setOngoing: (c) => set({ ongoing: c }),

      pullFromSupabase: async (userId) => {
        const [remote, remoteSchedules, userLists, remoteLogs] = await Promise.all([
          pullCrises(userId),
          pullSchedules(userId),
          pullUserLists(userId),
          pullLogs(userId),
        ])
        // Supabase is source of truth when connected — always replace local state
        set({
          crises: remote,
          usingSampleData: false,
          schedules: remoteSchedules,
          logs: remoteLogs,
          customSymptoms: userLists.symptoms,
          customTriggers: userLists.triggers,
        })
      },

      saveSchedule: (s, userId) => {
        const schedules = get().schedules.filter(x => x.id !== s.id)
        set({ schedules: [s, ...schedules] })
        if (userId) pushSchedule(s, userId)
      },

      deleteSchedule: (id, userId) => {
        set({ schedules: get().schedules.filter(s => s.id !== id) })
        if (userId) deleteScheduleRemote(id, userId)
      },

      markLog: (log, userId) => {
        const logs = get().logs.filter(l => !(l.scheduleId === log.scheduleId && l.date === log.date && l.time === log.time))
        set({ logs: [log, ...logs] })
        if (userId) pushLog(log, userId)
      },

      saveCustomSymptom: (item, userId) => {
        const list = [...get().customSymptoms.filter(x => x.key !== item.key), item]
        set({ customSymptoms: list })
        if (userId) pushUserList(userId, 'symptoms', list)
      },
      deleteCustomSymptom: (key, userId) => {
        const list = get().customSymptoms.filter(x => x.key !== key)
        set({ customSymptoms: list })
        if (userId) pushUserList(userId, 'symptoms', list)
      },

      saveCustomTrigger: (item, userId) => {
        const list = [...get().customTriggers.filter(x => x.key !== item.key), item]
        set({ customTriggers: list })
        if (userId) pushUserList(userId, 'triggers', list)
      },
      deleteCustomTrigger: (key, userId) => {
        const list = get().customTriggers.filter(x => x.key !== key)
        set({ customTriggers: list })
        if (userId) pushUserList(userId, 'triggers', list)
      },
    }),
    {
      name: 'migratrack-crisis',
      // Revive dates on rehydration
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.crises = state.crises.map(reviveCrisis)
          if (state.ongoing) state.ongoing = reviveCrisis(state.ongoing)
        }
      },
    }
  )
)
