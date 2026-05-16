import { memo, useCallback, useRef } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { Upload, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'

interface LogoNodeData { base64: string; mimeType: string; fileName: string }

function LogoNode({ id, data }: NodeProps) {
  const { base64, mimeType: _mimeType, fileName } = data as unknown as LogoNodeData
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

  const clear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      updateNodeData(id, { base64: '', mimeType: 'image/png', fileName: '' })
    },
    [id, updateNodeData]
  )

  return (
    <NodeWrapper id={id} label="Logo" dotColor="#ec4899" tooltip="Upload a brand logo — wire to Gemini node for brand-aware generation">
      {base64 ? (
        <div style={{ position: 'relative' }}>
          <div
            style={{
              background: 'repeating-conic-gradient(var(--border-base) 0% 25%, transparent 0% 50%) 0 0 / 12px 12px',
              borderRadius: 7,
              padding: 8,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 80,
            }}
          >
            <img src={base64} alt={fileName} style={{ maxWidth: '100%', maxHeight: 120, objectFit: 'contain' }} />
          </div>
          <button
            onClick={clear}
            style={{
              position: 'absolute', top: 6, right: 6,
              width: 22, height: 22, borderRadius: '50%',
              background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            title="Remove logo"
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
            ;(e.currentTarget as HTMLDivElement).style.borderColor = '#ec4899'
            ;(e.currentTarget as HTMLDivElement).style.background = 'rgba(236,72,153,0.06)'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-base)'
            ;(e.currentTarget as HTMLDivElement).style.background = 'transparent'
          }}
        >
          <Upload size={20} style={{ color: '#ec4899' }} />
          <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Drop logo
          </span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
      <TooltipHandle
        type="source"
        position={Position.Right}
        id="image-output"
        tooltip="Logo output"
        style={{ borderColor: '#ec4899' }}
      />
    </NodeWrapper>
  )
}

export default memo(LogoNode)
