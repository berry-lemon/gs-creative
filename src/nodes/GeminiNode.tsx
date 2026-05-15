import { memo, useCallback, useState } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { Sparkles, ChevronDown, ChevronUp, Loader2, Copy } from 'lucide-react'
import { useStore } from '../store/useStore'
import { generateText } from '../lib/gemini'

interface GeminiNodeData {
  systemPrompt: string
  model: string
  output: string
  isGenerating: boolean
}

interface TextNodeData {
  text: string
}

interface ImageNodeData {
  base64: string
  mimeType: string
}

interface PrevGeminiNodeData {
  output: string
}

const MODEL_OPTIONS = [
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
]

const IMAGE_HANDLE_IDS = ['image-0', 'image-1', 'image-2', 'image-3', 'image-4']

function GeminiNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as GeminiNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const apiKey = useStore((s) => s.apiKey)
  const { getEdges, getNode } = useReactFlow()
  const [systemExpanded, setSystemExpanded] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleSystemPromptChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      updateNodeData(id, { systemPrompt: e.target.value })
    },
    [id, updateNodeData]
  )

  const handleModelChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      updateNodeData(id, { model: e.target.value })
    },
    [id, updateNodeData]
  )

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      alert('Please set your Gemini API key in Settings (gear icon, top right).')
      return
    }

    if (nodeData.isGenerating) return

    const edges = getEdges()
    const incomingEdges = edges.filter((e) => e.target === id)

    let userPrompt = ''
    const images: Array<{ base64: string; mimeType: string }> = []

    for (const edge of incomingEdges) {
      const sourceNode = getNode(edge.source)
      if (!sourceNode) continue

      const handle = edge.targetHandle ?? ''

      if (handle === 'text-input') {
        const nodeType = sourceNode.type ?? ''
        if (nodeType === 'textNode') {
          const d = sourceNode.data as unknown as TextNodeData
          userPrompt = d.text ?? ''
        } else if (nodeType === 'geminiNode') {
          const d = sourceNode.data as unknown as PrevGeminiNodeData
          userPrompt = d.output ?? ''
        }
      } else if (IMAGE_HANDLE_IDS.includes(handle)) {
        const nodeType = sourceNode.type ?? ''
        if (nodeType === 'imageUploadNode' || nodeType === 'logoNode') {
          const d = sourceNode.data as unknown as ImageNodeData
          if (d.base64) {
            images.push({ base64: d.base64, mimeType: d.mimeType || 'image/png' })
          }
        }
      }
    }

    updateNodeData(id, { isGenerating: true, output: '' })

    try {
      await generateText(
        apiKey,
        nodeData.model || 'gemini-2.0-flash',
        nodeData.systemPrompt || '',
        userPrompt,
        images,
        (partialText) => {
          updateNodeData(id, { output: partialText })
        }
      )
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      updateNodeData(id, { output: `Error: ${msg}` })
    } finally {
      updateNodeData(id, { isGenerating: false })
    }
  }, [apiKey, id, nodeData, getEdges, getNode, updateNodeData])

  const handleCopyOutput = useCallback(() => {
    if (!nodeData.output) return
    navigator.clipboard.writeText(nodeData.output).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 1500)
    })
  }, [nodeData.output])

  return (
    <div className="gs-node" style={{ minWidth: 300, maxWidth: 360 }}>
      <div className="gs-node-header">
        <div className="gs-node-dot" style={{ background: '#00d4b4' }} />
        <Sparkles size={12} color="#9ca3af" />
        <span className="gs-node-title">Gemini</span>
        <div style={{ marginLeft: 'auto' }}>
          <select
            className="gs-select"
            value={nodeData.model || 'gemini-2.0-flash'}
            onChange={handleModelChange}
            style={{ width: 'auto', fontSize: 10, padding: '3px 22px 3px 8px', height: 24 }}
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Left handles: text input + 5 image inputs */}
      <div
        style={{
          position: 'absolute',
          left: -80,
          top: 48,
          display: 'flex',
          flexDirection: 'column',
          gap: 0,
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, height: 28, pointerEvents: 'none' }}>
          <span className="handle-label" style={{ fontSize: 9, color: '#6b7280', whiteSpace: 'nowrap' }}>
            Text
          </span>
        </div>
        {IMAGE_HANDLE_IDS.map((_, i) => (
          <div
            key={i}
            style={{ display: 'flex', alignItems: 'center', gap: 4, height: 28, pointerEvents: 'none' }}
          >
            <span className="handle-label" style={{ fontSize: 9, color: '#6b7280', whiteSpace: 'nowrap' }}>
              Image {i + 1}
            </span>
          </div>
        ))}
      </div>

      {/* Actual handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="text-input"
        style={{
          top: 60,
          background: '#0d0d0d',
          borderColor: '#a78bfa',
        }}
      />
      {IMAGE_HANDLE_IDS.map((hid, i) => (
        <Handle
          key={hid}
          type="target"
          position={Position.Left}
          id={hid}
          style={{
            top: 60 + 28 * (i + 1),
            background: '#0d0d0d',
            borderColor: '#f59e0b',
          }}
        />
      ))}

      <div className="gs-node-body" style={{ paddingTop: 10 }}>
        {/* System Prompt collapsible */}
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={() => setSystemExpanded((v) => !v)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'transparent',
              border: 'none',
              padding: '0 0 6px',
              cursor: 'pointer',
              width: '100%',
              textAlign: 'left',
            }}
          >
            <span className="gs-label" style={{ margin: 0, flex: 1 }}>
              System Prompt
            </span>
            {systemExpanded ? (
              <ChevronUp size={12} color="#6b7280" />
            ) : (
              <ChevronDown size={12} color="#6b7280" />
            )}
          </button>
          {systemExpanded && (
            <textarea
              className="gs-textarea"
              value={nodeData.systemPrompt}
              onChange={handleSystemPromptChange}
              placeholder="You are a helpful AI assistant..."
              rows={4}
              style={{ minHeight: 80 }}
            />
          )}
        </div>

        <hr className="gs-divider" />

        {/* Output */}
        <div style={{ marginBottom: 10 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <label className="gs-label" style={{ margin: 0 }}>
              Output
            </label>
            {nodeData.output && (
              <button
                onClick={handleCopyOutput}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: copySuccess ? '#00d4b4' : '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  fontSize: 10,
                  padding: 0,
                  transition: 'color 0.15s ease',
                }}
              >
                <Copy size={10} />
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
            )}
          </div>
          <div
            className={`gs-output${nodeData.isGenerating ? ' streaming' : ''}`}
            style={{ minHeight: 80, maxHeight: 240 }}
          >
            {nodeData.output ? (
              <span className={nodeData.isGenerating ? 'cursor-blink' : ''}>
                {nodeData.output}
              </span>
            ) : (
              <span style={{ color: '#4b5563', fontSize: 11 }}>
                {nodeData.isGenerating ? 'Generating...' : 'Output will appear here after generation'}
              </span>
            )}
          </div>
        </div>

        {/* Generate button */}
        <button
          className="gs-btn"
          onClick={handleGenerate}
          disabled={nodeData.isGenerating}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {nodeData.isGenerating ? (
            <>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={13} />
              Generate
            </>
          )}
        </button>

        {!apiKey && (
          <p style={{ margin: '8px 0 0', fontSize: 10, color: '#f59e0b', textAlign: 'center' }}>
            API key required — open Settings
          </p>
        )}
      </div>

      {/* Output handle right */}
      <Handle
        type="source"
        position={Position.Right}
        id="text-output"
        style={{ background: '#0d0d0d', borderColor: '#00d4b4', top: '50%' }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default memo(GeminiNode)
