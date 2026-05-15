import { useEffect, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '../store/useStore'
import { nodeTypes } from '../nodes'
import NodeToolbar from './NodeToolbar'
import TopBar from './TopBar'

export default function Canvas() {
  const nodes = useStore((s) => s.nodes)
  const edges = useStore((s) => s.edges)
  const onNodesChange = useStore((s) => s.onNodesChange)
  const onEdgesChange = useStore((s) => s.onEdgesChange)
  const onConnect = useStore((s) => s.onConnect)
  const loadFromUrl = useStore((s) => s.loadFromUrl)

  useEffect(() => {
    loadFromUrl()
  }, [loadFromUrl])

  const getNodeColor = useCallback((node: Node) => {
    switch (node.type) {
      case 'textNode':
        return '#a78bfa'
      case 'imageUploadNode':
        return '#f59e0b'
      case 'logoNode':
        return '#ec4899'
      case 'colorPaletteNode':
        return '#f59e0b'
      case 'fontNode':
        return '#10b981'
      case 'geminiNode':
        return '#00d4b4'
      case 'imageOutputNode':
        return '#6366f1'
      default:
        return '#4b5563'
    }
  }, [])

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      {/* Canvas takes full area */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
        }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          deleteKeyCode="Delete"
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            type: 'default',
            animated: true,
            style: { stroke: '#00d4b4', strokeWidth: 2 },
          }}
          style={{ background: '#0d0d0d' }}
          minZoom={0.1}
          maxZoom={2.5}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={24}
            size={1.5}
            color="#1e1e1e"
          />

          <Controls
            position="bottom-right"
            style={{ bottom: 24, right: 24 }}
          />

          <MiniMap
            position="bottom-right"
            style={{ bottom: 88, right: 24, width: 140, height: 88 }}
            nodeColor={getNodeColor}
            maskColor="rgba(0,0,0,0.6)"
            nodeStrokeWidth={0}
          />

          {/* Toolbar overlay */}
          <NodeToolbar />

          {/* TopBar overlay */}
          <TopBar />
        </ReactFlow>
      </div>
    </div>
  )
}
