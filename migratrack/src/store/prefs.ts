import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PrefsState {
  dark: boolean
  accent: string
  density: 'compact' | 'regular' | 'comfy'
  fontScale: number
  onboardingDone: boolean
  setDark: (v: boolean) => void
  setAccent: (v: string) => void
  setDensity: (v: 'compact' | 'regular' | 'comfy') => void
  setFontScale: (v: number) => void
  setOnboardingDone: (v: boolean) => void
}

export const usePrefs = create<PrefsState>()(
  persist(
    (set) => ({
      dark: false,
      accent: 'Lavande',
      density: 'regular',
      fontScale: 1,
      onboardingDone: false,
      setDark: (v) => set({ dark: v }),
      setAccent: (v) => set({ accent: v }),
      setDensity: (v) => set({ density: v }),
      setFontScale: (v) => set({ fontScale: v }),
      setOnboardingDone: (v) => set({ onboardingDone: v }),
    }),
    { name: 'migratrack-prefs' }
  )
)

export function useDensity() {
  const density = usePrefs(s => s.density)
  return density === 'compact' ? 0.84 : density === 'comfy' ? 1.12 : 1
}
