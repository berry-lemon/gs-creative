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
import { useIsMobile } from '../lib/useIsMobile'
import { nodeTypes } from '../nodes'
import DeletableEdge from './DeletableEdge'
import NodeToolbar from './NodeToolbar'
import TopBar from './TopBar'
import SettingsPanel from './SettingsPanel'

const edgeTypes = { default: DeletableEdge }

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
  const nodes           = useStore((s) => s.nodes)
  const edges           = useStore((s) => s.edges)
  const theme           = useStore((s) => s.theme)
  const gradientEnabled = useStore((s) => s.gradientEnabled)
  const onNodesChange   = useStore((s) => s.onNodesChange)
  const onEdgesChange   = useStore((s) => s.onEdgesChange)
  const onConnect       = useStore((s) => s.onConnect)
  const loadFromUrl     = useStore((s) => s.loadFromUrl)
  const isMobile        = useIsMobile()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    loadFromUrl()
  }, [loadFromUrl])

  // Escape key escape hatch: if a drag ever gets stuck, pressing Escape
  // fires a synthetic mouseup so ReactFlow can clean up its drag state.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const getNodeColor = useCallback((node: Node) => NODE_COLORS[node.type ?? ''] ?? '#4b5563', [])

  return (
    // Outer wrapper: NodeToolbar and TopBar sit HERE, as siblings of ReactFlow.
    // This prevents them from intercepting mouseup events during node drags.
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', background: 'var(--bg-canvas)' }}>

      {/* NodeToolbar and TopBar are OUTSIDE ReactFlow so pointer events during
          drag don't get swallowed by these panels */}
      <NodeToolbar />
      <TopBar />

      {/* ReactFlow fills the space left after toolbar/topbar */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          paddingLeft: isMobile ? 0 : 58,
          paddingTop: 48,
          paddingBottom: isMobile ? 64 : 0,
        }}
      >
        {/* Animated gradient blobs sit BEHIND ReactFlow nodes but above its bg */}
        {gradientEnabled && (
          <div className="gradient-bg" aria-hidden="true">
            <div className="blob blob-1" />
            <div className="blob blob-2" />
            <div className="blob blob-3" />
          </div>
        )}
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
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
          style={{ background: 'transparent', position: 'relative', zIndex: 1 }}
          minZoom={0.05}
          maxZoom={3}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={28}
            size={1.5}
            color="var(--border-base)"
          />
          <Controls />
          <MiniMap
            style={{ width: 140, height: 90 }}
            nodeColor={getNodeColor}
            maskColor="var(--minimap-mask)"
            nodeStrokeWidth={0}
          />
        </ReactFlow>
      </div>

      <SettingsPanel />
    </div>
  )
}
