import { memo, useCallback, useRef } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Plus, X } from 'lucide-react'
import { useStore } from '../store/useStore'

interface ColorPaletteNodeData {
  colors: string[]
}

function ColorPaletteNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as ColorPaletteNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const colorInputRef = useRef<HTMLInputElement>(null)
  const editingIndexRef = useRef<number>(-1)

  const addColor = useCallback(() => {
    const newColors = [...nodeData.colors, '#' + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0')]
    updateNodeData(id, { colors: newColors })
  }, [id, nodeData.colors, updateNodeData])

  const removeColor = useCallback(
    (index: number) => {
      const newColors = nodeData.colors.filter((_, i) => i !== index)
      updateNodeData(id, { colors: newColors.length > 0 ? newColors : ['#00d4b4'] })
    },
    [id, nodeData.colors, updateNodeData]
  )

  const openColorPicker = useCallback(
    (index: number) => {
      editingIndexRef.current = index
      if (colorInputRef.current) {
        colorInputRef.current.value = nodeData.colors[index] ?? '#000000'
        colorInputRef.current.click()
      }
    },
    [nodeData.colors]
  )

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const idx = editingIndexRef.current
      if (idx < 0) return
      const newColors = [...nodeData.colors]
      newColors[idx] = e.target.value
      updateNodeData(id, { colors: newColors })
    },
    [id, nodeData.colors, updateNodeData]
  )

  return (
    <div className="gs-node" style={{ minWidth: 260 }}>
      <div className="gs-node-header">
        <div className="gs-node-dot" style={{ background: '#f59e0b' }} />
        <span className="gs-node-title">Color Palette</span>
      </div>
      <div className="gs-node-body">
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            alignItems: 'center',
          }}
        >
          {nodeData.colors.map((color, index) => (
            <div
              key={index}
              style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => openColorPicker(index)}
                  title={color}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 8,
                    background: color,
                    cursor: 'pointer',
                    border: '2px solid #2a2a2a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'transform 0.1s ease, border-color 0.1s ease',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = '#4a4a4a'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
                    ;(e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a'
                  }}
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    removeColor(index)
                  }}
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#1a1a1a',
                    border: '1px solid #3a3a3a',
                    color: '#9ca3af',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                    opacity: 0,
                    transition: 'opacity 0.15s ease',
                  }}
                  className="color-remove-btn"
                >
                  <X size={8} />
                </button>
              </div>
              <span
                style={{
                  fontSize: 9,
                  color: '#6b7280',
                  fontFamily: 'monospace',
                  letterSpacing: '0.02em',
                }}
              >
                {color.toUpperCase()}
              </span>
            </div>
          ))}
          <button
            onClick={addColor}
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#0d0d0d',
              border: '2px dashed #2a2a2a',
              color: '#4b5563',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#f59e0b'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#f59e0b'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#4b5563'
            }}
          >
            <Plus size={16} />
          </button>
        </div>
        <input
          ref={colorInputRef}
          type="color"
          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
          onChange={handleColorChange}
        />
        <style>{`
          .gs-node:hover .color-remove-btn {
            opacity: 1 !important;
          }
        `}</style>
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="palette-output"
        style={{ background: '#0d0d0d', borderColor: '#f59e0b' }}
      />
    </div>
  )
}

export default memo(ColorPaletteNode)
