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
import SettingsPanel from './SettingsPanel'

const NODE_COLORS: Record<string, string> = {
  textNode:         '#a78bfa',
  imageUploadNode:  '#f59e0b',
  logoNode:         '#ec4899',
  colorPaletteNode: '#f59e0b',
  fontNode:         '#10b981',
  geminiNode:       '#76ff03',
  imageOutputNode:  '#6366f1',
}

export default function Canvas() {
  const nodes         = useStore((s) => s.nodes)
  const edges         = useStore((s) => s.edges)
  const theme         = useStore((s) => s.theme)
  const onNodesChange = useStore((s) => s.onNodesChange)
  const onEdgesChange = useStore((s) => s.onEdgesChange)
  const onConnect     = useStore((s) => s.onConnect)
  const loadFromUrl   = useStore((s) => s.loadFromUrl)

  // Apply theme to <html> on mount and whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    loadFromUrl()
  }, [loadFromUrl])

  const getNodeColor = useCallback((node: Node) => NODE_COLORS[node.type ?? ''] ?? '#4b5563', [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        deleteKeyCode={['Delete', 'Backspace']}
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'default',
          animated: true,
          style: { stroke: 'var(--edge-color)', strokeWidth: 2 },
        }}
        style={{ background: 'var(--bg-canvas)' }}
        minZoom={0.05}
        maxZoom={3}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1.5}
          color="var(--border-base)"
        />

        <Controls position="bottom-right" style={{ bottom: 24, right: 24 }} />

        <MiniMap
          position="bottom-right"
          style={{ bottom: 136, right: 24, width: 140, height: 90 }}
          nodeColor={getNodeColor}
          maskColor="var(--minimap-mask)"
          nodeStrokeWidth={0}
        />

        {/* Left toolbar */}
        <NodeToolbar />

        {/* Top bar */}
        <TopBar />
      </ReactFlow>

      {/* Settings overlay — outside ReactFlow so it can cover it */}
      <SettingsPanel />
    </div>
  )
}
