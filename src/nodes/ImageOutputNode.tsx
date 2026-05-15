import { memo } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { Monitor, ImageOff } from 'lucide-react'

interface ImageNodeData {
  base64: string
  mimeType: string
  fileName: string
}

function ImageOutputNode({ id }: NodeProps) {
  const { getEdges, getNode } = useReactFlow()

  // Dynamically read connected image source
  const edges = getEdges()
  const incomingEdge = edges.find((e) => e.target === id)
  let imageSrc = ''
  let fileName = ''

  if (incomingEdge) {
    const sourceNode = getNode(incomingEdge.source)
    if (sourceNode) {
      const d = sourceNode.data as unknown as ImageNodeData
      if (d.base64) {
        imageSrc = d.base64
        fileName = d.fileName || ''
      }
    }
  }

  return (
    <div className="gs-node" style={{ minWidth: 280 }}>
      <div className="gs-node-header">
        <div className="gs-node-dot" style={{ background: '#6366f1' }} />
        <Monitor size={12} color="#9ca3af" />
        <span className="gs-node-title">Image Output</span>
      </div>
      <div className="gs-node-body">
        {imageSrc ? (
          <div>
            <img
              src={imageSrc}
              alt={fileName || 'output'}
              style={{
                width: '100%',
                borderRadius: 8,
                display: 'block',
                border: '1px solid #2a2a2a',
                maxHeight: 320,
                objectFit: 'contain',
                background: '#0d0d0d',
              }}
            />
            {fileName && (
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 10,
                  color: '#6b7280',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {fileName}
              </p>
            )}
          </div>
        ) : (
          <div
            style={{
              border: '2px dashed #2a2a2a',
              borderRadius: 8,
              padding: '32px 16px',
              textAlign: 'center',
              background: '#0d0d0d',
            }}
          >
            <ImageOff size={24} color="#2a2a2a" style={{ margin: '0 auto 8px' }} />
            <p style={{ margin: 0, fontSize: 12, color: '#4b5563', lineHeight: 1.5 }}>
              Connect an image source
              <br />
              <span style={{ fontSize: 10, color: '#3a3a3a' }}>ImageUpload or Logo node</span>
            </p>
          </div>
        )}
      </div>
      <Handle
        type="target"
        position={Position.Left}
        id="image-input"
        style={{ background: '#0d0d0d', borderColor: '#6366f1' }}
      />
    </div>
  )
}

export default memo(ImageOutputNode)
