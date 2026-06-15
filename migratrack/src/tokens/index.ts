// Design tokens — faithfully ported from design data.jsx

export interface ThemeTokens {
  bg: string; surface: string; card: string; cardTint: string; cardBorder: string
  field: string; fieldBorder: string; onSurface: string; onSurfaceVariant: string
  outline: string; primaryContainer: string; onPrimaryContainer: string
  shadow: string; navBg: string; statusDark: boolean
}

export const THEMES: Record<'light' | 'dark', ThemeTokens> = {
  light: {
    bg: '#F8F7FC',
    surface: '#F8F7FC',
    card: '#FFFFFF',
    cardTint: '#F1EEFA',
    cardBorder: 'rgba(92,95,170,0.10)',
    field: '#FFFFFF',
    fieldBorder: 'rgba(73,69,79,0.22)',
    onSurface: '#1C1B22',
    onSurfaceVariant: '#5B566B',
    outline: 'rgba(73,69,79,0.18)',
    primaryContainer: '#E5E1F8',
    onPrimaryContainer: '#191353',
    shadow: '0 1px 2px rgba(28,27,34,0.04), 0 8px 24px rgba(92,95,170,0.07)',
    navBg: 'rgba(248,247,252,0.86)',
    statusDark: false,
  },
  dark: {
    bg: '#1C1B22',
    surface: '#1C1B22',
    card: '#26252F',
    cardTint: '#2A2935',
    cardBorder: 'rgba(255,255,255,0.06)',
    field: '#26252F',
    fieldBorder: 'rgba(255,255,255,0.16)',
    onSurface: '#E8E4F0',
    onSurfaceVariant: '#A8A2BB',
    outline: 'rgba(255,255,255,0.14)',
    primaryContainer: '#3A3A66',
    onPrimaryContainer: '#E5E1FF',
    shadow: '0 1px 2px rgba(0,0,0,0.3), 0 10px 30px rgba(0,0,0,0.35)',
    navBg: 'rgba(28,27,34,0.82)',
    statusDark: true,
  },
}

export const ACCENTS: Record<string, { light: string; dark: string }> = {
  'Lavande':       { light: '#5C5FAA', dark: '#9A9DDB' },
  'Indigo':        { light: '#5159C9', dark: '#9499F0' },
  'Prune':         { light: '#7A5AA8', dark: '#BFA0E0' },
  'Bleu ardoise':  { light: '#4F6DA8', dark: '#8FA9DE' },
}

export const ACCENT_KEYS = Object.keys(ACCENTS)

// Intensity color scale: green → yellow → red
function lerp(a: number[], b: number[], t: number) {
  return a.map((x, i) => Math.round(x + (b[i] - x) * t))
}

export function intensityRGB(level: number): [number, number, number] {
  const t = (Math.min(10, Math.max(1, level)) - 1) / 9
  const green = [76, 175, 80], yellow = [255, 193, 7], red = [229, 115, 115]
  const c = t <= 0.5 ? lerp(green, yellow, t * 2) : lerp(yellow, red, (t - 0.5) * 2)
  return [c[0], c[1], c[2]]
}

export function intensityColor(level: number) {
  const [r, g, b] = intensityRGB(level)
  return `rgb(${r},${g},${b})`
}

export function intensitySoft(level: number, a = 0.16) {
  const [r, g, b] = intensityRGB(level)
  return `rgba(${r},${g},${b},${a})`
}

export function intensityBand(level: number): 'Légère' | 'Modérée' | 'Forte' {
  if (level <= 3) return 'Légère'
  if (level <= 6) return 'Modérée'
  return 'Forte'
}

export const CAT_PALETTE = ['#6C6FBE', '#7FB6A6', '#C98AA8', '#E0A878', '#8AA6D6', '#A89BCB', '#7BB0C4', '#C9A86A']
