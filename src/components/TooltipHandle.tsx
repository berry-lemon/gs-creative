import { useState } from 'react'
import { Handle, type HandleProps } from '@xyflow/react'

interface Props extends Omit<HandleProps, 'style'> {
  tooltip: string
  style?: React.CSSProperties
  offsetX?: number
  offsetY?: number
}

export default function TooltipHandle({ tooltip, offsetX: _offsetX = 0, offsetY: _offsetY = 0, style, ...rest }: Props) {
  const [visible, setVisible] = useState(false)
  const isRight = rest.position === 'right'
  const isLeft = !isRight

  const tipStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    ...(isLeft ? { right: '100%', marginRight: 10 } : { left: '100%', marginLeft: 10 }),
    background: 'var(--bg-node)',
    border: '1px solid var(--border-base)',
    borderRadius: 5,
    padding: '3px 7px',
    fontFamily: 'var(--font-display)',
    fontSize: 8,
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: 'var(--text-muted)',
    whiteSpace: 'nowrap' as const,
    pointerEvents: 'none' as const,
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.12s',
    zIndex: 9999,
    boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
    marginLeft: _offsetX,
    marginTop: _offsetY,
  }

  return (
    <div
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      <Handle {...rest} style={style} />
      <span style={tipStyle}>{tooltip}</span>
    </div>
  )
}
