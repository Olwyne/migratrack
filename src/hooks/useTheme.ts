import { useContext } from 'react'
import { ThemeCtx, ThemeContextValue } from '../components/layout/ThemeProvider'

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeCtx)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
