import { useTheme } from '../../hooks/useTheme'
import { Icon } from './Icon'

interface Props {
  label: string
  selected: boolean
  onClick: () => void
  small?: boolean
}

export function Chip({ label, selected, onClick, small = false }: Props) {
  const { T, A, dark } = useTheme()
  return (
    <button type="button" onClick={onClick} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
      borderRadius: 9999, fontFamily: 'inherit', fontWeight: 600,
      fontSize: small ? 12.5 : 13.5, padding: small ? '6px 11px' : '8px 14px',
      border: selected ? `1.5px solid ${A}` : `1.5px solid ${T.outline}`,
      background: selected ? (dark ? A + '2E' : A + '18') : 'transparent',
      color: selected ? (dark ? '#fff' : A) : T.onSurfaceVariant,
      transition: 'all .15s',
    }}>
      {selected && <Icon name="check" size={small ? 13 : 15} color={dark ? '#fff' : A} stroke={2.6} />}
      {label}
    </button>
  )
}
