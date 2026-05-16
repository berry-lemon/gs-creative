import { memo, useCallback } from 'react'
import { Position, type NodeProps } from '@xyflow/react'
import { useStore } from '../store/useStore'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'

interface TextNodeData { text: string }

function TextNode({ id, data }: NodeProps) {
  const { text } = data as unknown as TextNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => updateNodeData(id, { text: e.target.value }),
    [id, updateNodeData]
  )

  return (
    <NodeWrapper id={id} label="Text" dotColor="#a78bfa" tooltip="Text / prompt node — outputs plain text to connected nodes">
      <textarea
        className="gs-textarea"
        value={text}
        onChange={handleChange}
        placeholder="Enter your text or prompt…"
        rows={4}
        style={{ minHeight: 80, maxHeight: 320 }}
      />
      <TooltipHandle
        type="source"
        position={Position.Right}
        id="text-output"
        tooltip="Text output"
        style={{ borderColor: '#a78bfa' }}
      />
    </NodeWrapper>
  )
}

export default memo(TextNode)
