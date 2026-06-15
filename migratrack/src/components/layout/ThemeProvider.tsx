import { createContext, useMemo, useEffect, ReactNode } from 'react'
import { THEMES, ACCENTS, ThemeTokens } from '../../tokens'
import { usePrefs } from '../../store/prefs'

export interface ThemeContextValue {
  T: ThemeTokens
  A: string      // accent color (resolved for current mode)
  dark: boolean
}

export const ThemeCtx = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { dark, accent } = usePrefs()
  const T = dark ? THEMES.dark : THEMES.light
  const A = (ACCENTS[accent] || ACCENTS['Lavande'])[dark ? 'dark' : 'light']

  const value = useMemo(() => ({ T, A, dark }), [T, A, dark])

  useEffect(() => {
    document.documentElement.style.background = T.bg
    document.body.style.background = T.bg
  }, [T.bg])

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>
}
