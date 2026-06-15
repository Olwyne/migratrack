import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { MigraineCrisis, TreatmentSchedule, TreatmentLog } from '../data/types'
import { SAMPLE_CRISES, SAMPLE_SCHEDULES, SAMPLE_LOGS } from '../data/sample'
import { pullCrises, pushCrisis, deleteCrisisRemote } from '../data/sync'

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
  saveSchedule: (s: TreatmentSchedule) => void
  deleteSchedule: (id: string) => void
  // Logs
  markLog: (log: TreatmentLog) => void
  // Custom items
  saveCustomSymptom: (item: CustomItem) => void
  deleteCustomSymptom: (key: string) => void
  saveCustomTrigger: (item: CustomItem) => void
  deleteCustomTrigger: (key: string) => void
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
        const remote = await pullCrises(userId)
        if (remote.length > 0) {
          set({ crises: remote, usingSampleData: false })
        } else {
          // User has no remote data yet — clear sample data, start fresh
          set({ crises: [], usingSampleData: false })
        }
      },

      saveSchedule: (s) => {
        const schedules = get().schedules.filter(x => x.id !== s.id)
        set({ schedules: [s, ...schedules] })
      },

      deleteSchedule: (id) => set({ schedules: get().schedules.filter(s => s.id !== id) }),

      markLog: (log) => {
        const logs = get().logs.filter(l => !(l.scheduleId === log.scheduleId && l.date === log.date && l.time === log.time))
        set({ logs: [log, ...logs] })
      },

      saveCustomSymptom: (item) => {
        const list = get().customSymptoms.filter(x => x.key !== item.key)
        set({ customSymptoms: [...list, item] })
      },
      deleteCustomSymptom: (key) => set({ customSymptoms: get().customSymptoms.filter(x => x.key !== key) }),

      saveCustomTrigger: (item) => {
        const list = get().customTriggers.filter(x => x.key !== item.key)
        set({ customTriggers: [...list, item] })
      },
      deleteCustomTrigger: (key) => set({ customTriggers: get().customTriggers.filter(x => x.key !== key) }),
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
