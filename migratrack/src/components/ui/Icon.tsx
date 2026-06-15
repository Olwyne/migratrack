import { CSSProperties } from 'react'

const ICON_PATHS: Record<string, string> = {
  home: 'M3 10.5 12 4l9 6.5M5 9.5V20h14V9.5M9.5 20v-5.5h5V20',
  calendar: 'M7 3v3M17 3v3M4 8.5h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  chart: 'M4 20V4M4 20h16M8 20v-6M12 20v-10M16 20v-4',
  report: 'M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13.5 3v4.5H18M9 12h6M9 15.5h6M9 8.5h2',
  settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.3 1a7.5 7.5 0 0 0-1.7-1l-.3-2.6H10.9l-.3 2.6a7.5 7.5 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7.5 7.5 0 0 0 1.7 1l.3 2.6h4.2l.3-2.6a7.5 7.5 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5Z',
  plus: 'M12 5v14M5 12h14',
  check: 'M5 12.5 10 17.5 19 6.5',
  chevronR: 'M9 5l7 7-7 7',
  chevronL: 'M15 5l-7 7 7 7',
  close: 'M6 6l12 12M18 6 6 18',
  trash: 'M5 7h14M10 7V5h4v2M6 7l1 13h10l1-13M10 11v5M14 11v5',
  pulse: 'M3 12h4l2.5-7 4 14 2.5-7H21',
  bolt: 'M13 3 5 13h6l-1 8 8-10h-6l1-8Z',
  cloud: 'M7 18a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.3A3.7 3.7 0 0 1 18 18H7Z',
  pin: 'M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
  pill: 'M10.5 13.5 7 17a4.95 4.95 0 0 1-7-7l7-7a4.95 4.95 0 0 1 7 7l-3.5 3.5M8 6l7 7',
  warning: 'M12 3 2 20h20L12 3ZM12 10v5M12 18v.5',
  shield: 'M12 3 5 6v6c0 4.2 3 7.5 7 9 4-1.5 7-4.8 7-9V6l-7-3ZM9 12l2 2 4-4',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7.5V12l3 2',
  moon: 'M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 2v2M12 20v2M4 12H2M22 12h-2M5 5 6.5 6.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19',
  drop: 'M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z',
  steps: 'M8 4c1.5 0 2.5 1.3 2.5 3.5S9.5 14 8 14s-2.5-1-2.5-3 1-7 2.5-7ZM16 9c1.5 0 2.5 1.3 2.5 3.5S15.5 19 14 19s-2.5-1-2.5-3 1-7 2.5-7Z',
  share: 'M16 6l-4-4-4 4M12 2v13M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7',
  download: 'M12 3v12M7 10l5 5 5-5M5 19h14',
  doc: 'M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM13.5 3v4.5H18',
  edit: 'M4 20h4L18.5 9.5a2 2 0 0 0-3-3L5 17v3ZM14 7l3 3',
  arrowUp: 'M12 19V6M6 12l6-6 6 6',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4l2-2ZM10 20a2 2 0 0 0 4 0',
  flame: 'M12 3c1 3 4 4.5 4 8a4 4 0 0 1-8 0c0-1.2.6-2.2 1.3-3 .3 1 .9 1.5 1.7 1.5-.5-2 .3-4.3 1-6.5Z',
  user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM3 21a9 9 0 0 1 18 0',
  mail: 'M4 4h16a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM3 5l9 8 9-8',
  eye: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  eyeOff: 'M17.9 17.9A10.9 10.9 0 0 1 12 20C5 20 1 12 1 12a18.5 18.5 0 0 1 5.1-5.9M9.9 4.2A9.3 9.3 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.2 3.2M1 1l22 22M14.1 14.1A3 3 0 0 1 9.9 9.9',
  thermometer: 'M10 13.5V5a2 2 0 1 1 4 0v8.5a4 4 0 1 1-4 0ZM12 9v6',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  database: 'M12 8c4.4 0 8-1.8 8-4s-3.6-4-8-4-8 1.8-8 4 3.6 4 8 4ZM4 4v4c0 2.2 3.6 4 8 4s8-1.8 8-4V4M4 12v4c0 2.2 3.6 4 8 4s8-1.8 8-4v-4',
}

interface Props {
  name: string
  size?: number
  color?: string
  stroke?: number
  fill?: string
  style?: CSSProperties
}

export function Icon({ name, size = 22, color = 'currentColor', stroke = 2, fill = 'none', style = {} }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
      strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"
      style={{ flexShrink: 0, ...style }}>
      <path d={ICON_PATHS[name] || ''} />
    </svg>
  )
}
