import { useState, useCallback } from 'react'
import { useReactFlow } from '@xyflow/react'
import {
  Type,
  Image,
  ImagePlus,
  Palette,
  Sparkles,
  Monitor,
  Baseline,
} from 'lucide-react'
import { useStore } from '../store/useStore'

interface ToolItem {
  type: string
  label: string
  icon: React.ReactNode
  color: string
  description: string
}

const TOOLS: ToolItem[] = [
  {
    type: 'textNode',
    label: 'Text',
    icon: <Type size={18} />,
    color: '#a78bfa',
    description: 'Text prompt or copy',
  },
  {
    type: 'imageUploadNode',
    label: 'Image',
    icon: <Image size={18} />,
    color: '#f59e0b',
    description: 'Upload an image',
  },
  {
    type: 'logoNode',
    label: 'Logo',
    icon: <ImagePlus size={18} />,
    color: '#ec4899',
    description: 'Upload a logo',
  },
  {
    type: 'colorPaletteNode',
    label: 'Palette',
    icon: <Palette size={18} />,
    color: '#f59e0b',
    description: 'Color palette',
  },
  {
    type: 'fontNode',
    label: 'Font',
    icon: <Baseline size={18} />,
    color: '#10b981',
    description: 'Google Font selector',
  },
  {
    type: 'geminiNode',
    label: 'Gemini',
    icon: <Sparkles size={18} />,
    color: '#00d4b4',
    description: 'AI text generation',
  },
  {
    type: 'imageOutputNode',
    label: 'Output',
    icon: <Monitor size={18} />,
    color: '#6366f1',
    description: 'Display image output',
  },
]

export default function NodeToolbar() {
  const addNode = useStore((s) => s.addNode)
  const { getViewport } = useReactFlow()
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const handleAdd = useCallback(
    (type: string) => {
      const viewport = getViewport()
      // Place new node near center of current viewport
      const x = (-viewport.x + window.innerWidth / 2 - 130) / viewport.zoom
      const y = (-viewport.y + window.innerHeight / 2 - 80) / viewport.zoom
      // Add small random offset so nodes don't stack
      const jitterX = (Math.random() - 0.5) * 60
      const jitterY = (Math.random() - 0.5) * 60
      addNode(type, { x: x + jitterX, y: y + jitterY })
    },
    [addNode, getViewport]
  )

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 56,
        background: '#111111',
        borderRight: '1px solid #1e1e1e',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 8,
        paddingBottom: 8,
        gap: 2,
        zIndex: 10,
      }}
    >
      {/* Logo mark */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #00d4b4 0%, #0099ff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
          flexShrink: 0,
          boxShadow: '0 0 12px rgba(0, 212, 180, 0.4)',
        }}
      >
        <Sparkles size={14} color="#0d0d0d" />
      </div>

      {TOOLS.map((tool, index) => (
        <div
          key={tool.type}
          style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <button
            onClick={() => handleAdd(tool.type)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            title={tool.label}
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: hoveredIndex === index ? '#1e1e1e' : 'transparent',
              border: `1px solid ${hoveredIndex === index ? '#2a2a2a' : 'transparent'}`,
              color: hoveredIndex === index ? tool.color : '#6b7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              position: 'relative',
            }}
          >
            {tool.icon}
            {hoveredIndex === index && (
              <div
                style={{
                  position: 'absolute',
                  left: '100%',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  marginLeft: 12,
                  background: '#1e1e1e',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  padding: '6px 12px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 100,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}
              >
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#e5e5e5' }}>
                  {tool.label}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 10, color: '#6b7280' }}>
                  {tool.description}
                </p>
              </div>
            )}
          </button>
        </div>
      ))}

      {/* Divider */}
      <div
        style={{
          width: 28,
          height: 1,
          background: '#1e1e1e',
          marginTop: 4,
          marginBottom: 4,
          flexShrink: 0,
        }}
      />
    </div>
  )
}
