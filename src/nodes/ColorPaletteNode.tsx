import { memo, useCallback, useRef } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { Plus, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'

interface ColorPaletteData { colors: string[] }

function ColorPaletteNode({ id, data }: NodeProps) {
  const { colors } = data as unknown as ColorPaletteData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  const updateColor = useCallback(
    (index: number, value: string) => {
      const next = [...colors]
      next[index] = value
      updateNodeData(id, { colors: next })
    },
    [id, colors, updateNodeData]
  )

  const addColor = useCallback(() => {
    if (colors.length >= 10) return
    updateNodeData(id, { colors: [...colors, '#76ff03'] })
  }, [id, colors, updateNodeData])

  const removeColor = useCallback(
    (index: number) => {
      const next = colors.filter((_, i) => i !== index)
      updateNodeData(id, { colors: next })
    },
    [id, colors, updateNodeData]
  )

  return (
    <NodeWrapper id={id} label="Palette" dotColor="#f59e0b" tooltip="Color palette — defines brand colors, wired to Gemini for context">
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {colors.map((color, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div
              onClick={() => inputRefs.current[i]?.click()}
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: color,
                cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.12)',
                boxShadow: `0 0 8px ${color}55`,
                transition: 'transform 0.12s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
              title={color}
            />
            <input
              ref={(el) => { inputRefs.current[i] = el }}
              type="color"
              value={color}
              onChange={(e) => updateColor(i, e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            />
            <button
              onClick={() => removeColor(i)}
              style={{
                position: 'absolute', top: -6, right: -6,
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--bg-node)', border: '1px solid var(--border-base)',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: 0, fontSize: 9,
              }}
              title="Remove"
            >
              <X size={8} />
            </button>
          </div>
        ))}
        {colors.length < 10 && (
          <button
            onClick={addColor}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'var(--bg-display)', border: '1px dashed var(--border-base)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'border-color 0.12s, color 0.12s',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-base)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
            }}
            title="Add color"
          >
            <Plus size={14} />
          </button>
        )}
      </div>
      <p style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>
        {colors.length} color{colors.length !== 1 ? 's' : ''} · click swatch to edit
      </p>
      <TooltipHandle
        type="source"
        position={Position.Right}
        id="palette-output"
        tooltip="Colors (JSON array)"
        style={{ borderColor: '#f59e0b' }}
      />
    </NodeWrapper>
  )
}

export default memo(ColorPaletteNode)
