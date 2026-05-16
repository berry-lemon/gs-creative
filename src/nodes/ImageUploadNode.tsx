import { memo, useCallback, useRef } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { Upload, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'

interface ImageNodeData { base64: string; mimeType: string; fileName: string }

function ImageUploadNode({ id, data }: NodeProps) {
  const { base64, mimeType: _mimeType, fileName } = data as unknown as ImageNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        updateNodeData(id, { base64: result, mimeType: file.type, fileName: file.name })
      }
      reader.readAsDataURL(file)
    },
    [id, updateNodeData]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file?.type.startsWith('image/')) handleFile(file)
    },
    [handleFile]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const clear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      updateNodeData(id, { base64: '', mimeType: 'image/png', fileName: '' })
    },
    [id, updateNodeData]
  )

  return (
    <NodeWrapper id={id} label="Image" dotColor="#f59e0b" tooltip="Upload an image to use as input for AI generation nodes">
      {base64 ? (
        <div style={{ position: 'relative' }}>
          <img
            src={base64}
            alt={fileName}
            style={{ width: '100%', borderRadius: 7, display: 'block', maxHeight: 200, objectFit: 'cover' }}
          />
          <button
            onClick={clear}
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Remove image"
          >
            <X size={11} />
          </button>
          <p style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fileName}
          </p>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          style={{
            border: '1px dashed var(--border-base)',
            borderRadius: 8,
            padding: '28px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
            cursor: 'pointer',
            transition: 'border-color 0.12s, background 0.12s',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'
            ;(e.currentTarget as HTMLDivElement).style.background = 'var(--accent-bg)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-base)'
            ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
          }}
        >
          <Upload size={20} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Drop or click
          </span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleInputChange} />
      <TooltipHandle
        type="source"
        position={Position.Right}
        id="image-output"
        tooltip="Image output"
        style={{ borderColor: '#f59e0b' }}
      />
    </NodeWrapper>
  )
}

export default memo(ImageUploadNode)
