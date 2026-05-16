import { getBezierPath, EdgeLabelRenderer, BaseEdge, type EdgeProps, useReactFlow } from '@xyflow/react'
import { X } from 'lucide-react'
import { useState } from 'react'

export default function DeletableEdge({
  id,
  sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition,
  style,
  markerEnd,
  selected,
}: EdgeProps) {
  const [hovered, setHovered] = useState(false)
  const { setEdges } = useReactFlow()

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition,
  })

  const deleteEdge = (e: React.MouseEvent) => {
    e.stopPropagation()
    setEdges((eds) => eds.filter((ed) => ed.id !== id))
  }

  const visible = hovered || selected

  return (
    <>
      {/* Invisible wide hit-area path */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer' }}
      />
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: visible ? 'var(--accent)' : style?.stroke,
          strokeWidth: visible ? 2.5 : 2,
          filter: visible
            ? 'drop-shadow(0 0 8px var(--accent-glow))'
            : `drop-shadow(0 0 5px var(--edge-glow))`,
          transition: 'stroke 0.12s, filter 0.12s',
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.15s',
          }}
          className="nodrag nopan"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <button
            onClick={deleteEdge}
            title="Remove connection"
            style={{
              width: 20,
              height: 20,
              borderRadius: '50%',
              background: '#1a1a18',
              border: '1px solid #ff5555',
              color: '#ff5555',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 8px rgba(255,85,85,0.4)',
              transition: 'transform 0.1s',
            }}
            onMouseEnter={(e) => { (e.currentTarget).style.transform = 'scale(1.2)' }}
            onMouseLeave={(e) => { (e.currentTarget).style.transform = 'scale(1)' }}
          >
            <X size={10} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
