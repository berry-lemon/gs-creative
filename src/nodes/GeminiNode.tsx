import { memo, useCallback, useState } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { Sparkles, ChevronDown, ChevronUp, Loader2, Copy } from 'lucide-react'
import { useStore } from '../store/useStore'
import { generateText } from '../lib/gemini'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'

interface GeminiNodeData { systemPrompt: string; model: string; output: string; isGenerating: boolean }
interface TextNodeData { text: string }
interface ImageNodeData { base64: string; mimeType: string }
interface PrevGeminiData { output: string }

const MODEL_OPTIONS = [
  { value: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro' },
  { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
]

const IMAGE_HANDLE_IDS = ['image-0', 'image-1', 'image-2', 'image-3', 'image-4']
const HANDLE_SPACING = 30

function GeminiNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as GeminiNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const apiKey = useStore((s) => s.apiKey)
  const { getEdges, getNode } = useReactFlow()
  const [systemExpanded, setSystemExpanded] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleGenerate = useCallback(async () => {
    if (!apiKey) {
      alert('Open Settings (top-right gear) and enter your Gemini API key.')
      return
    }
    if (nodeData.isGenerating) return

    const edges = getEdges()
    const incomingEdges = edges.filter((e) => e.target === id)
    let userPrompt = ''
    const images: Array<{ base64: string; mimeType: string }> = []

    for (const edge of incomingEdges) {
      const src = getNode(edge.source)
      if (!src) continue
      const handle = edge.targetHandle ?? ''
      if (handle === 'text-input') {
        if (src.type === 'textNode') {
          userPrompt = ((src.data as unknown as TextNodeData).text) ?? ''
        } else if (src.type === 'geminiNode') {
          userPrompt = ((src.data as unknown as PrevGeminiData).output) ?? ''
        }
      } else if (IMAGE_HANDLE_IDS.includes(handle)) {
        if (src.type === 'imageUploadNode' || src.type === 'logoNode') {
          const d = src.data as unknown as ImageNodeData
          if (d.base64) images.push({ base64: d.base64, mimeType: d.mimeType || 'image/png' })
        }
      }
    }

    updateNodeData(id, { isGenerating: true, output: '' })
    try {
      await generateText(apiKey, nodeData.model || 'gemini-2.0-flash', nodeData.systemPrompt || '', userPrompt, images, (partial) => {
        updateNodeData(id, { output: partial })
      })
    } catch (err) {
      updateNodeData(id, { output: `Error: ${err instanceof Error ? err.message : String(err)}` })
    } finally {
      updateNodeData(id, { isGenerating: false })
    }
  }, [apiKey, id, nodeData, getEdges, getNode, updateNodeData])

  const handleCopy = useCallback(() => {
    if (!nodeData.output) return
    navigator.clipboard.writeText(nodeData.output).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 1500)
    })
  }, [nodeData.output])

  /* Handle positions — relative to node top */
  const TEXT_TOP = 48
  const imgTops = IMAGE_HANDLE_IDS.map((_, i) => TEXT_TOP + HANDLE_SPACING * (i + 1))

  return (
    <div style={{ position: 'relative' }}>
      {/* Left target handles rendered outside NodeWrapper for positioning */}
      <Handle
        type="target"
        position={Position.Left}
        id="text-input"
        style={{ top: TEXT_TOP, borderColor: '#a78bfa', background: 'var(--bg-display)' }}
        title="Text / prompt input"
      />
      {IMAGE_HANDLE_IDS.map((hid, i) => (
        <Handle
          key={hid}
          type="target"
          position={Position.Left}
          id={hid}
          style={{ top: imgTops[i], borderColor: '#f59e0b', background: 'var(--bg-display)' }}
          title={`Image input ${i + 1}`}
        />
      ))}

      {/* Handle labels pinned to left of node */}
      <div style={{ position: 'absolute', left: -68, top: TEXT_TOP - 8, display: 'flex', flexDirection: 'column', gap: 0, pointerEvents: 'none' }}>
        <div style={{ height: HANDLE_SPACING, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Text</span>
        </div>
        {IMAGE_HANDLE_IDS.map((_, i) => (
          <div key={i} style={{ height: HANDLE_SPACING, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Img {i + 1}</span>
          </div>
        ))}
      </div>

      <NodeWrapper id={id} label="Gemini" dotColor="var(--accent)" tooltip="AI text generation — connect Text and Image nodes as inputs" minWidth={300}>
        {/* Model selector inline in the body */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Sparkles size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <select
            className="gs-select"
            value={nodeData.model || 'gemini-2.0-flash'}
            onChange={(e) => updateNodeData(id, { model: e.target.value })}
            style={{ fontSize: 10, height: 28, padding: '0 24px 0 8px' }}
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* System prompt collapsible */}
        <button
          onClick={() => setSystemExpanded((v) => !v)}
          style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'transparent', border: 'none', padding: '4px 0', cursor: 'pointer', width: '100%' }}
        >
          <span className="gs-label" style={{ margin: 0, flex: 1 }}>System Prompt</span>
          {systemExpanded ? <ChevronUp size={11} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={11} style={{ color: 'var(--text-muted)' }} />}
        </button>
        {systemExpanded && (
          <textarea
            className="gs-textarea"
            value={nodeData.systemPrompt}
            onChange={(e) => updateNodeData(id, { systemPrompt: e.target.value })}
            placeholder="You are an expert creative director…"
            rows={3}
            style={{ minHeight: 70, marginBottom: 8 }}
          />
        )}

        <hr className="gs-divider" />

        {/* Output */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <label className="gs-label" style={{ margin: 0 }}>Output</label>
          {nodeData.output && (
            <button
              onClick={handleCopy}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: copySuccess ? 'var(--accent)' : 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3, fontSize: 9, fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: 0, transition: 'color 0.12s' }}
            >
              <Copy size={9} />
              {copySuccess ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
        <div className={`gs-output${nodeData.isGenerating ? ' streaming' : ''}`} style={{ minHeight: 80, maxHeight: 240, marginBottom: 10 }}>
          {nodeData.output
            ? <span className={nodeData.isGenerating ? 'cursor-blink' : ''}>{nodeData.output}</span>
            : <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>{nodeData.isGenerating ? 'Generating…' : 'Output will appear here'}</span>
          }
        </div>

        <button
          className="gs-btn"
          onClick={handleGenerate}
          disabled={nodeData.isGenerating}
          style={{ width: '100%', justifyContent: 'center' }}
        >
          {nodeData.isGenerating
            ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Generating…</>
            : <><Sparkles size={12} /> Generate</>
          }
        </button>

        {!apiKey && (
          <p style={{ marginTop: 8, fontSize: 9, fontFamily: 'var(--font-display)', color: '#f59e0b', textAlign: 'center', letterSpacing: '0.06em' }}>
            API key required — open Settings ↗
          </p>
        )}
      </NodeWrapper>

      {/* Output handle */}
      <TooltipHandle
        type="source"
        position={Position.Right}
        id="text-output"
        tooltip="Generated text output"
        style={{ top: '50%', borderColor: 'var(--accent)', background: 'var(--bg-display)' }}
      />

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}

export default memo(GeminiNode)
