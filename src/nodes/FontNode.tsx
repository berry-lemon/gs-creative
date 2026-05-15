import { memo, useCallback, useEffect, useRef } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useStore } from '../store/useStore'

interface FontNodeData {
  fontName: string
  preview: string
}

const loadedFonts = new Set<string>()

function loadGoogleFont(fontName: string) {
  const key = fontName.trim()
  if (!key || loadedFonts.has(key)) return
  loadedFonts.add(key)
  const encoded = encodeURIComponent(key).replace(/%20/g, '+')
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = `https://fonts.googleapis.com/css2?family=${encoded}:wght@400;700&display=swap`
  document.head.appendChild(link)
}

function FontNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as FontNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (nodeData.fontName) {
      loadGoogleFont(nodeData.fontName)
    }
  }, [nodeData.fontName])

  const handleFontChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      updateNodeData(id, { fontName: val })
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        loadGoogleFont(val)
      }, 600)
    },
    [id, updateNodeData]
  )

  const handlePreviewChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateNodeData(id, { preview: e.target.value })
    },
    [id, updateNodeData]
  )

  return (
    <div className="gs-node" style={{ minWidth: 260 }}>
      <div className="gs-node-header">
        <div className="gs-node-dot" style={{ background: '#10b981' }} />
        <span className="gs-node-title">Font</span>
      </div>
      <div className="gs-node-body">
        <div style={{ marginBottom: 10 }}>
          <label className="gs-label">Google Font Name</label>
          <input
            className="gs-input"
            value={nodeData.fontName}
            onChange={handleFontChange}
            placeholder="e.g. Playfair Display"
          />
        </div>
        <div style={{ marginBottom: 10 }}>
          <label className="gs-label">Preview Text</label>
          <input
            className="gs-input"
            value={nodeData.preview}
            onChange={handlePreviewChange}
            placeholder="The quick brown fox..."
          />
        </div>
        {nodeData.fontName && (
          <div
            style={{
              background: '#0d0d0d',
              border: '1px solid #2a2a2a',
              borderRadius: 8,
              padding: '12px 14px',
            }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: `'${nodeData.fontName}', sans-serif`,
                fontSize: 20,
                color: '#e5e5e5',
                lineHeight: 1.3,
              }}
            >
              {nodeData.preview || 'The quick brown fox'}
            </p>
            <p
              style={{
                margin: '8px 0 0',
                fontFamily: `'${nodeData.fontName}', sans-serif`,
                fontSize: 13,
                color: '#9ca3af',
                fontWeight: 700,
              }}
            >
              AaBbCcDd 123
            </p>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 10,
                color: '#4b5563',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {nodeData.fontName}
            </p>
          </div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="font-output"
        style={{ background: '#0d0d0d', borderColor: '#10b981' }}
      />
    </div>
  )
}

export default memo(FontNode)
