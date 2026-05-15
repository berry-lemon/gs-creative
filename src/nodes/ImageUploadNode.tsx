import { memo, useCallback, useRef } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Image, Upload } from 'lucide-react'
import { useStore } from '../store/useStore'

interface ImageUploadNodeData {
  base64: string
  mimeType: string
  fileName: string
}

function ImageUploadNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as ImageUploadNodeData
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
        <div className="gs-node-dot" style={{ background: '#f59e0b' }} />
        <Image size={12} color="#9ca3af" />
        <span className="gs-node-title">Image Upload</span>
      </div>
      <div className="gs-node-body">
        {nodeData.base64 ? (
          <div style={{ position: 'relative' }}>
            <img
              src={nodeData.base64}
              alt={nodeData.fileName || 'uploaded'}
              style={{
                width: '100%',
                borderRadius: 8,
                display: 'block',
                border: '1px solid #2a2a2a',
                maxHeight: 200,
                objectFit: 'contain',
                background: '#0d0d0d',
              }}
            />
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
              ;(e.currentTarget as HTMLDivElement).style.borderColor = '#00d4b4'
              ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(0,212,180,0.04)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLDivElement).style.borderColor = '#2a2a2a'
              ;(e.currentTarget as HTMLDivElement).style.background = '#0d0d0d'
            }}
          >
            <Upload size={20} color="#4b5563" style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', lineHeight: 1.5 }}>
              Drop an image here
              <br />
              <span style={{ fontSize: 10, color: '#4b5563' }}>or click to browse</span>
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
        style={{ background: '#0d0d0d', borderColor: '#f59e0b' }}
      />
    </div>
  )
}

export default memo(ImageUploadNode)
