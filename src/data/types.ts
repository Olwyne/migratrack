export interface IntensityEntry {
  t: Date
  v: number
}

export interface TreatmentEntry {
  name: string
  eff: number // 1-5
  takenAt: Date | null
}

export interface MigraineCrisis {
  id: string
  start: Date
  end: Date | null
  intensity: number
  locations: string[]
  symptoms: string[]
  triggers: string[]
  treatments: TreatmentEntry[]
  intensityHistory: IntensityEntry[]
  notes: string
  weatherPressure: number | null
  weatherDescription: string | null
}

export interface TreatmentSchedule {
  id: string
  name: string
  dose: string
  times: string[] // e.g. ['08:00', '21:00']
  active: boolean
}

export interface TreatmentLog {
  id: string
  scheduleId: string
  date: string // YYYY-MM-DD
  time: string
  taken: boolean
  takenAt: string | null
}

export interface UserGoals {
  stepsTarget: number
  stepsToday: number
  waterTarget: number
  waterToday: number
}

export interface Streak {
  current: number
  best: number
}

export type AccentKey = 'Lavande' | 'Indigo' | 'Prune' | 'Bleu ardoise'

export const SYMPTOMS: Record<string, string> = {
  symptom_nausea: 'Nausée',
  symptom_light_sensitivity: 'Sensibilité à la lumière',
  symptom_sound_sensitivity: 'Sensibilité au bruit',
  symptom_aura: 'Aura',
  symptom_dizziness: 'Vertiges',
  symptom_vomiting: 'Vomissements',
}

export const TRIGGERS: Record<string, string> = {
  trigger_stress: 'Stress',
  trigger_sleep: 'Sommeil',
  trigger_alcohol: 'Alcool',
  trigger_food: 'Alimentation',
  trigger_weather: 'Météo',
  trigger_menstruation: 'Règles',
  trigger_screen: 'Écran',
  trigger_dehydration: 'Déshydratation',
}

export const SYMPTOM_KEYS = Object.keys(SYMPTOMS)
export const TRIGGER_KEYS = Object.keys(TRIGGERS)

export const LOCATIONS = [
  'Vertex', 'Front', 'Tempe droite', 'Tempe gauche',
  'Œil droit', 'Œil gauche', 'Occiput', 'Nuque', 'Crâne entier',
]
