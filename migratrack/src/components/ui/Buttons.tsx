import { CSSProperties, ReactNode, MouseEvent } from 'react'
import { useTheme } from '../../hooks/useTheme'
import { Icon } from './Icon'

interface BtnProps {
  children: ReactNode
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void
  icon?: string
  big?: boolean
  style?: CSSProperties
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function PrimaryButton({ children, onClick, icon, big = false, style = {}, disabled, type = 'button' }: BtnProps) {
  const { A } = useTheme()
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      width: '100%', border: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
      background: disabled ? '#aaa' : A, color: '#fff', borderRadius: 16,
      padding: big ? '22px 24px' : '15px 22px',
      fontFamily: 'inherit', fontSize: big ? 18 : 15.5, fontWeight: 700,
      letterSpacing: 0.1, boxShadow: disabled ? 'none' : `0 6px 18px ${A}38`,
      transition: 'transform .12s, box-shadow .2s', ...style,
    }}
      onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.985)' }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)' }}>
      {icon && <Icon name={icon} size={big ? 26 : 20} color="#fff" stroke={2.2} />}
      {children}
    </button>
  )
}

export function TonalButton({ children, onClick, icon, style = {} }: BtnProps) {
  const { T } = useTheme()
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: '100%', cursor: 'pointer', border: 'none',
      background: T.primaryContainer, color: T.onPrimaryContainer, borderRadius: 14,
      padding: '13px 18px', fontFamily: 'inherit', fontSize: 15, fontWeight: 650, ...style,
    }}>
      {icon && <Icon name={icon} size={19} color={T.onPrimaryContainer} stroke={2.2} />}
      {children}
    </button>
  )
}

export function OutlineButton({ children, onClick, icon, style = {} }: BtnProps) {
  const { A } = useTheme()
  return (
    <button type="button" onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      width: '100%', cursor: 'pointer', background: 'transparent',
      border: `1.5px solid ${A}66`, color: A, borderRadius: 14,
      padding: '12px 18px', fontFamily: 'inherit', fontSize: 14.5, fontWeight: 650, ...style,
    }}>
      {icon && <Icon name={icon} size={18} color={A} stroke={2.2} />}
      {children}
    </button>
  )
}

export function IconButton({ icon, onClick, size = 40, color }: { icon: string; onClick?: () => void; size?: number; color?: string }) {
  const { T } = useTheme()
  return (
    <button type="button" onClick={onClick} style={{
      width: size, height: size, borderRadius: size / 2, border: 'none',
      background: T.cardTint, cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <Icon name={icon} size={Math.round(size * 0.5)} color={color || T.onSurfaceVariant} stroke={2} />
    </button>
  )
}
