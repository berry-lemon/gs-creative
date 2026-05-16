import { memo, useCallback, useEffect, useState } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { useStore } from '../store/useStore'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'

interface FontNodeData { fontName: string; preview: string }

function loadGoogleFont(name: string) {
  const id = `gfont-${name.replace(/\s+/g, '-')}`
  if (document.getElementById(id)) return
  const link = document.createElement('link')
  link.id = id
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(name)}&display=swap`
  document.head.appendChild(link)
}

function FontNode({ id, data }: NodeProps) {
  const { fontName, preview } = data as unknown as FontNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const [input, setInput] = useState(fontName)

  useEffect(() => {
    if (fontName) loadGoogleFont(fontName)
  }, [fontName])

  const apply = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return
    loadGoogleFont(trimmed)
    updateNodeData(id, { fontName: trimmed })
  }, [id, input, updateNodeData])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => { if (e.key === 'Enter') apply() },
    [apply]
  )

  return (
    <NodeWrapper id={id} label="Font" dotColor="#10b981" tooltip="Select a Google Font by name — press Enter to load the preview" minWidth={260}>
      <label className="gs-label">Google Font Name</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <input
          className="gs-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. Space Grotesk"
          style={{ flex: 1 }}
        />
        <button className="gs-btn" onClick={apply} style={{ padding: '8px 12px', fontSize: 9, flexShrink: 0 }}>
          Load
        </button>
      </div>

      {fontName && (
        <div
          style={{
            background: 'var(--bg-display)',
            border: '1px solid var(--border-base)',
            borderRadius: 7,
            padding: '16px 14px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
          }}
        >
          <p
            style={{
              fontFamily: `'${fontName}', serif`,
              fontSize: 28,
              lineHeight: 1.2,
              color: 'var(--text-primary)',
              margin: 0,
              marginBottom: 6,
            }}
          >
            Aa
          </p>
          <p
            style={{
              fontFamily: `'${fontName}', serif`,
              fontSize: 13,
              color: 'var(--text-muted)',
              margin: 0,
            }}
          >
            {fontName}
          </p>
        </div>
      )}

      <div style={{ marginTop: 10 }}>
        <label className="gs-label">Sample Text</label>
        <input
          className="gs-input"
          value={preview}
          onChange={(e) => updateNodeData(id, { preview: e.target.value })}
          placeholder="The quick brown fox…"
          style={{ fontFamily: fontName ? `'${fontName}', serif` : 'var(--font-mono)' }}
        />
      </div>

      <TooltipHandle
        type="source"
        position={Position.Right}
        id="font-output"
        tooltip="Font name output"
        style={{ borderColor: '#10b981' }}
      />
    </NodeWrapper>
  )
}

export default memo(FontNode)
