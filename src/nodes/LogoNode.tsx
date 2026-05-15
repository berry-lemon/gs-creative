import { memo, useCallback, useRef } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { ImagePlus, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'

interface LogoNodeData {
  base64: string
  mimeType: string
  fileName: string
}

function LogoNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as LogoNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateNodeData(id, {
          base64: result,
          mimeType: file.type,
          fileName: file.name,
        })
      }
      reader.readAsDataURL(file)
    },
    [id, updateNodeData]
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleClear = useCallback(() => {
    updateNodeData(id, { base64: '', mimeType: 'image/png', fileName: '' })
    if (inputRef.current) inputRef.current.value = ''
  }, [id, updateNodeData])

  return (
    <div className="gs-node" style={{ minWidth: 260 }}>
      <div className="gs-node-header">
        <div className="gs-node-dot" style={{ background: '#ec4899' }} />
        <ImagePlus size={12} color="#9ca3af" />
        <span className="gs-node-title">Logo</span>
      </div>
      <div className="gs-node-body">
        {nodeData.base64 ? (
          <div style={{ position: 'relative' }}>
            <div
              style={{
                background: 'repeating-conic-gradient(#1a1a1a 0% 25%, #0d0d0d 0% 50%) 0 0 / 16px 16px',
                borderRadius: 8,
                border: '1px solid #2a2a2a',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={nodeData.base64}
                alt={nodeData.fileName || 'logo'}
                style={{
                  maxWidth: '100%',
                  maxHeight: 120,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 6,
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                }}
              >
                {nodeData.fileName}
              </span>
              <button
                onClick={handleClear}
                style={{
                  background: 'transparent',
                  border: '1px solid #2a2a2a',
                  borderRadius: 6,
                  color: '#6b7280',
                  fontSize: 10,
                  padding: '3px 8px',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                Clear
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => inputRef.current?.click()}
            style={{
              border: '2px dashed #2a2a2a',
              borderRadius: 8,
              padding: '24px 16px',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: '#0d0d0d',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = '#ec4899'
              ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(236,72,153,0.04)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a'
              ;(e.currentTarget as HTMLDivElement).style.background = '#0d0d0d'
            }}
          >
            <Upload size={20} color="#4b5563" style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
              Drop your logo here
              <br />
              <span style={{ fontSize: 10, color: '#4b5563' }}>PNG with transparency recommended</span>
            </p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="image-output"
        style={{ background: '#0d0d0d', borderColor: '#ec4899' }}
      />
    </div>
  )
}

export default memo(LogoNode)
