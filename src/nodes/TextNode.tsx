import { memo, useCallback } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { useStore } from '../store/useStore'

interface TextNodeData {
  text: string
}

function TextNode({ id, data }: NodeProps) {
  const nodeData = data as TextNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { text: e.target.value })
    },
    [id, updateNodeData]
  )

  return (
    <div className="gs-node" style={{ minWidth: 260 }}>
      <div className="gs-node-header">
        <div className="gs-node-dot" style={{ background: '#a78bfa' }} />
        <span className="gs-node-title">Text</span>
      </div>
      <div className="gs-node-body">
        <textarea
          className="gs-textarea"
          value={nodeData.text}
          onChange={handleChange}
          placeholder="Enter your text or prompt..."
          rows={4}
          style={{ minHeight: 80, maxHeight: 300 }}
        />
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="text-output"
        style={{ background: '#0d0d0d', borderColor: '#a78bfa' }}
      />
    </div>
  )
}

export default memo(TextNode)
