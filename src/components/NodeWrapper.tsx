import { type ReactNode, useCallback } from 'react'
import { useStore } from '../store/useStore'

interface Props {
  id: string
  label: string
  dotColor: string
  tooltip: string
  children: ReactNode
  minWidth?: number
  className?: string
}

export default function NodeWrapper({ id, label, dotColor, tooltip: _tooltip, children, minWidth = 248, className = '' }: Props) {
  const deleteNode = useStore((s) => s.deleteNode)

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      deleteNode(id)
    },
    [id, deleteNode]
  )

  return (
    <div
      className={`gs-node ${className}`}
      style={{ minWidth }}
      title={_tooltip}
    >
      <div className="gs-node-header">
        <div
          className="gs-node-dot"
          style={{ background: dotColor, color: dotColor }}
        />
        <span className="gs-node-title">{label}</span>
        <button
          className="gs-node-delete"
          onClick={handleDelete}
          title="Delete node"
        >
          ×
        </button>
      </div>
      <div className="gs-node-body">{children}</div>
    </div>
  )
}
