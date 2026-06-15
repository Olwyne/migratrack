import { MigraineCrisis, TreatmentEntry, TreatmentLog, TreatmentSchedule, UserGoals, Streak } from './types'

const NOW = new Date()

function d(daysAgo: number, h = 9, m = 0) {
  const x = new Date(NOW)
  x.setDate(x.getDate() - daysAgo)
  x.setHours(h, m, 0, 0)
  return x
}

function tx(name: string, eff: number, day: Date, h: number, m: number): TreatmentEntry {
  return { name, eff, takenAt: new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m) }
}

let _id = 0
const uid = () => `sample_c${++_id}`

export const SAMPLE_CRISES: MigraineCrisis[] = [
  {
    id: uid(), start: d(2,14,30), end: d(2,18,10), intensity: 7,
    location: 'Tempe droite',
    symptoms: ['symptom_light_sensitivity','symptom_nausea','symptom_aura'],
    triggers: ['trigger_stress','trigger_screen'],
    treatments: [tx('Sumatriptan',4,d(2),15,5), tx('Ibuprofène',3,d(2),14,50)],
    intensityHistory: [
      {t:d(2,14,30),v:5},{t:d(2,15,30),v:7},
      {t:d(2,16,30),v:6},{t:d(2,17,30),v:3},{t:d(2,18,10),v:2},
    ],
    notes: "Démarrée après une longue journée devant l'écran.",
    weatherPressure: 1004, weatherDescription: 'Couvert, pluie légère',
  },
  {
    id: uid(), start: d(5,8,15), end: d(5,10,0), intensity: 4,
    location: 'Front',
    symptoms: ['symptom_sound_sensitivity'],
    triggers: ['trigger_sleep'],
    treatments: [tx('Paracétamol',3,d(5),8,30)],
    intensityHistory: [{t:d(5,8,15),v:4},{t:d(5,9,15),v:3},{t:d(5,10,0),v:1}],
    notes: 'Nuit trop courte.',
    weatherPressure: 1012, weatherDescription: 'Ensoleillé',
  },
  {
    id: uid(), start: d(9,19,40), end: d(9,23,30), intensity: 9,
    location: 'Œil gauche',
    symptoms: ['symptom_light_sensitivity','symptom_nausea','symptom_vomiting','symptom_aura'],
    triggers: ['trigger_stress','trigger_menstruation','trigger_food'],
    treatments: [tx('Sumatriptan',5,d(9),20,10), tx('Métoclopramide',4,d(9),20,15)],
    intensityHistory: [
      {t:d(9,19,40),v:6},{t:d(9,20,30),v:9},
      {t:d(9,21,30),v:8},{t:d(9,22,30),v:5},{t:d(9,23,30),v:2},
    ],
    notes: 'Crise sévère, pièce sombre nécessaire.',
    weatherPressure: 998, weatherDescription: 'Orageux',
  },
  {
    id: uid(), start: d(13,11,0), end: d(13,13,20), intensity: 5,
    location: 'Tempe gauche',
    symptoms: ['symptom_dizziness','symptom_light_sensitivity'],
    triggers: ['trigger_dehydration','trigger_weather'],
    treatments: [tx('Ibuprofène',4,d(13),11,20)],
    intensityHistory: [{t:d(13,11,0),v:5},{t:d(13,12,0),v:4},{t:d(13,13,20),v:2}],
    notes: '', weatherPressure: 1001, weatherDescription: 'Nuageux',
  },
  {
    id: uid(), start: d(16,7,50), end: d(16,9,5), intensity: 3,
    location: 'Nuque',
    symptoms: ['symptom_sound_sensitivity'],
    triggers: ['trigger_sleep','trigger_screen'],
    treatments: [tx('Paracétamol',3,d(16),8,0)],
    intensityHistory: [{t:d(16,7,50),v:3},{t:d(16,9,5),v:1}],
    notes: '', weatherPressure: 1015, weatherDescription: 'Dégagé',
  },
  {
    id: uid(), start: d(20,16,30), end: d(20,20,0), intensity: 8,
    location: 'Tempe droite',
    symptoms: ['symptom_light_sensitivity','symptom_nausea','symptom_aura'],
    triggers: ['trigger_stress','trigger_alcohol'],
    treatments: [tx('Sumatriptan',4,d(20),17,0)],
    intensityHistory: [
      {t:d(20,16,30),v:5},{t:d(20,17,30),v:8},
      {t:d(20,18,30),v:6},{t:d(20,20,0),v:3},
    ],
    notes: 'Verre de vin la veille + semaine chargée.',
    weatherPressure: 1007, weatherDescription: 'Couvert',
  },
  {
    id: uid(), start: d(24,13,10), end: d(24,15,0), intensity: 5,
    location: 'Front',
    symptoms: ['symptom_light_sensitivity'],
    triggers: ['trigger_food','trigger_stress'],
    treatments: [tx('Ibuprofène',3,d(24),13,25)],
    intensityHistory: [{t:d(24,13,10),v:5},{t:d(24,14,0),v:4},{t:d(24,15,0),v:2}],
    notes: '', weatherPressure: 1010, weatherDescription: 'Variable',
  },
  {
    id: uid(), start: d(28,9,30), end: d(28,12,45), intensity: 6,
    location: 'Œil gauche',
    symptoms: ['symptom_nausea','symptom_dizziness'],
    triggers: ['trigger_menstruation','trigger_weather'],
    treatments: [tx('Sumatriptan',4,d(28),10,0), tx('Paracétamol',2,d(28),9,45)],
    intensityHistory: [{t:d(28,9,30),v:6},{t:d(28,11,0),v:5},{t:d(28,12,45),v:2}],
    notes: '', weatherPressure: 1000, weatherDescription: 'Pluvieux',
  },
  {
    id: uid(), start: d(34,20,0), end: d(34,22,15), intensity: 4,
    location: 'Tempe gauche',
    symptoms: ['symptom_sound_sensitivity','symptom_light_sensitivity'],
    triggers: ['trigger_screen'],
    treatments: [tx('Paracétamol',3,d(34),20,20)],
    intensityHistory: [{t:d(34,20,0),v:4},{t:d(34,22,15),v:1}],
    notes: '', weatherPressure: 1013, weatherDescription: 'Dégagé',
  },
  {
    id: uid(), start: d(41,10,15), end: d(41,14,0), intensity: 7,
    location: 'Tempe droite',
    symptoms: ['symptom_light_sensitivity','symptom_nausea'],
    triggers: ['trigger_stress','trigger_sleep'],
    treatments: [tx('Sumatriptan',5,d(41),10,45)],
    intensityHistory: [{t:d(41,10,15),v:7},{t:d(41,12,0),v:5},{t:d(41,14,0),v:2}],
    notes: '', weatherPressure: 1003, weatherDescription: 'Couvert',
  },
]

export const SAMPLE_ONGOING: MigraineCrisis = {
  id: 'ongoing', start: d(0,15,5), end: null, intensity: 6,
  location: 'Tempe droite',
  symptoms: ['symptom_light_sensitivity'],
  triggers: ['trigger_stress'],
  treatments: [tx('Ibuprofène',3,d(0),15,20)],
  intensityHistory: [{t:d(0,15,5),v:4},{t:d(0,16,0),v:6}],
  notes: '', weatherPressure: 1002, weatherDescription: 'Couvert',
}

export const SAMPLE_SCHEDULES: TreatmentSchedule[] = [
  { id: 's1', name: 'Magnésium', dose: '300 mg', times: ['08:00','21:00'], active: true },
  { id: 's2', name: 'Propranolol', dose: '40 mg', times: ['13:00'], active: true },
]

export const SAMPLE_LOGS: TreatmentLog[] = [
  { id: 'l1', scheduleId: 's1', date: new Date().toISOString().slice(0,10), time: '08:00', taken: true, takenAt: '08:05' },
]

export const SAMPLE_GOALS: UserGoals = { stepsTarget: 6000, stepsToday: 4200, waterTarget: 2.0, waterToday: 1.3 }
export const SAMPLE_STREAK: Streak = { current: 2, best: 14 }
