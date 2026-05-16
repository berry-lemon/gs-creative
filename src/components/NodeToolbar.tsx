import { useState, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import { Type, Image, ImagePlus, Palette, Sparkles, Monitor, Baseline } from 'lucide-react'
import { useStore } from '../store/useStore'

interface ToolItem {
  type: string
  label: string
  description: string
  icon: React.ReactNode
  dot: string
}

const TOOLS: ToolItem[] = [
  { type: 'textNode',         label: 'Text',    description: 'Prompt or copy text — wires to Gemini as input',  icon: <Type size={16} />,      dot: '#a78bfa' },
  { type: 'imageUploadNode',  label: 'Image',   description: 'Upload an image for visual AI input',             icon: <Image size={16} />,     dot: '#f59e0b' },
  { type: 'logoNode',         label: 'Logo',    description: 'Upload a brand logo with transparency support',   icon: <ImagePlus size={16} />, dot: '#ec4899' },
  { type: 'colorPaletteNode', label: 'Palette', description: 'Define brand colors — click swatches to edit',   icon: <Palette size={16} />,   dot: '#f59e0b' },
  { type: 'fontNode',         label: 'Font',    description: 'Load any Google Font with live preview',          icon: <Baseline size={16} />,  dot: '#10b981' },
  { type: 'geminiNode',       label: 'Gemini',  description: 'AI text generation — streaming, multi-modal',    icon: <Sparkles size={16} />,  dot: 'var(--accent)' },
  { type: 'imageOutputNode',  label: 'Output',  description: 'Display an image piped from an upstream node',   icon: <Monitor size={16} />,   dot: '#6366f1' },
]

export default function NodeToolbar() {
  const addNode = useStore((s) => s.addNode)
  const { getViewport } = useReactFlow()
  const [hovered, setHovered] = useState<number | null>(null)

  const handleAdd = useCallback(
    (type: string) => {
      const vp = getViewport()
      const x = (-vp.x + window.innerWidth / 2 - 130) / vp.zoom + (Math.random() - 0.5) * 80
      const y = (-vp.y + window.innerHeight / 2 - 80) / vp.zoom + (Math.random() - 0.5) * 80
      addNode(type, { x, y })
    },
    [addNode, getViewport]
  )

  return (
    <div
      style={{
        position: 'absolute',
        left: 0, top: 48, bottom: 0,
        width: 58,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-base)',
        boxShadow: 'inset -1px 0 0 var(--border-hi)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 10,
        paddingBottom: 10,
        gap: 4,
        zIndex: 10,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-dim) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
          flexShrink: 0,
          boxShadow: '0 0 16px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.3)',
        }}
      >
        <Sparkles size={14} color="#040a02" />
      </div>

      <div style={{ width: 30, height: 1, background: 'var(--border-base)', marginBottom: 4 }} />

      {TOOLS.map((tool, index) => (
        <div key={tool.type} style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={() => handleAdd(tool.type)}
            onMouseEnter={() => setHovered(index)}
            onMouseLeave={() => setHovered(null)}
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: hovered === index ? 'var(--accent-bg)' : 'transparent',
              border: `1px solid ${hovered === index ? 'var(--border-hi)' : 'transparent'}`,
              color: hovered === index ? tool.dot : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2,
              transition: 'all 0.12s',
              boxShadow: hovered === index ? `0 0 12px ${tool.dot}33` : 'none',
            }}
          >
            {tool.icon}
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 6, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1 }}>
              {tool.label}
            </span>

            {/* Tooltip */}
            {hovered === index && (
              <div
                style={{
                  position: 'absolute',
                  left: 'calc(100% + 12px)',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--bg-node)',
                  border: '1px solid var(--border-base)',
                  boxShadow: 'var(--node-shadow)',
                  borderRadius: 9,
                  padding: '8px 12px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 100,
                  minWidth: 180,
                }}
              >
                {/* LED dot */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: tool.dot, boxShadow: `0 0 6px ${tool.dot}` }} />
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                    {tool.label}
                  </span>
                </div>
                <p style={{ margin: 0, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {tool.description}
                </p>
              </div>
            )}
          </button>
        </div>
      ))}
    </div>
  )
}
