import { memo } from 'react'
import { Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { ImageOff } from 'lucide-react'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'

interface ImageNodeData { base64: string; mimeType: string }

function ImageOutputNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as ImageNodeData
  const { getEdges, getNode } = useReactFlow()

  const edges = getEdges()
  const incoming = edges.find((e) => e.target === id)
  let src = nodeData.base64 || ''

  if (incoming) {
    const sourceNode = getNode(incoming.source)
    if (sourceNode) {
      const sd = sourceNode.data as unknown as ImageNodeData
      if (sd?.base64) src = sd.base64
    }
  }

  return (
    <NodeWrapper id={id} label="Output" dotColor="#6366f1" tooltip="Displays an image piped from an upstream image node" minWidth={280}>
      <TooltipHandle
        type="target"
        position={Position.Left}
        id="image-input"
        tooltip="Image input"
        style={{ borderColor: '#6366f1' }}
      />
      {src ? (
        <img
          src={src}
          alt="Output"
          style={{
            width: '100%',
            borderRadius: 8,
            display: 'block',
            maxHeight: 320,
            objectFit: 'contain',
            background: 'var(--bg-display)',
          }}
        />
      ) : (
        <div
          style={{
            background: 'var(--bg-display)',
            border: '1px dashed var(--border-base)',
            borderRadius: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            minHeight: 160,
            color: 'var(--text-dim)',
          }}
        >
          <ImageOff size={28} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Connect an image node
          </span>
        </div>
      )}
    </NodeWrapper>
  )
}

export default memo(ImageOutputNode)
