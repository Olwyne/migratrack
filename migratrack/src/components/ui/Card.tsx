import { CSSProperties, ReactNode, MouseEvent } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { usePrefs } from '../../store/prefs'

interface Props {
  children: ReactNode
  style?: CSSProperties
  onClick?: (e: MouseEvent<HTMLDivElement>) => void
  pad?: number
}

export function Card({ children, style = {}, onClick, pad = 18 }: Props) {
  const { T } = useTheme()
  const { dark } = usePrefs()
  // Use a simple "Net" style (bordered) as default — matches design default
  const bg = T.card
  const border = `1px solid ${T.cardBorder}`
  const shadow = 'none'

  return (
    <div onClick={onClick} style={{
      background: bg, borderRadius: 14, border, boxShadow: shadow,
      padding: pad, boxSizing: 'border-box',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'background .25s, border-color .25s',
      ...style,
    }}>
      {children}
    </div>
  )
}
