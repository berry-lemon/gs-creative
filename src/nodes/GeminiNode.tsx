import { memo, useCallback, useState } from 'react'
import { Handle, Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { Brain, ChevronDown, ChevronUp, Loader2, Copy } from 'lucide-react'
import { useStore } from '../store/useStore'
import { generateText } from '../lib/gemini'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'

interface BrainNodeData { systemPrompt: string; model: string; output: string; isGenerating: boolean }
interface TextNodeData { text: string }
interface ImageNodeData { base64: string; mimeType: string }
interface PrevBrainData { output: string }

// Model stays internal — users never see these names
const DEFAULT_MODEL = 'gemini-2.0-flash'
const ADVANCED_MODELS = [
  { value: 'gemini-2.0-flash',  label: 'Fast'    },
  { value: 'gemini-2.5-pro',    label: 'Detailed' },
  { value: 'gemini-1.5-flash',  label: 'Balanced' },
]

const IMAGE_HANDLE_IDS = ['image-0', 'image-1', 'image-2', 'image-3', 'image-4']
const HANDLE_SPACING = 30

function GeminiNode({ id, data }: NodeProps) {
  const nodeData = data as unknown as BrainNodeData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const apiKey = useStore((s) => s.apiKey)
  const { getEdges, getNode } = useReactFlow()
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  const handleAsk = useCallback(async () => {
    if (!apiKey) {
      alert('A connection key is required. Open Settings (top-right ⚙) and paste your key.')
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
          userPrompt = ((src.data as unknown as PrevBrainData).output) ?? ''
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
      await generateText(
        apiKey,
        nodeData.model || DEFAULT_MODEL,
        nodeData.systemPrompt || '',
        userPrompt,
        images,
        (partial) => updateNodeData(id, { output: partial })
      )
    } catch (err) {
      updateNodeData(id, { output: `Something went wrong: ${err instanceof Error ? err.message : String(err)}` })
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

  const TEXT_TOP = 48
  const imgTops = IMAGE_HANDLE_IDS.map((_, i) => TEXT_TOP + HANDLE_SPACING * (i + 1))

  return (
    <div style={{ position: 'relative' }}>
      {/* Input handles */}
      <Handle
        type="target" position={Position.Left} id="text-input"
        style={{ top: TEXT_TOP, borderColor: '#a78bfa', background: 'var(--bg-display)' }}
        title="Ask — connect a text node here"
      />
      {IMAGE_HANDLE_IDS.map((hid, i) => (
        <Handle
          key={hid} type="target" position={Position.Left} id={hid}
          style={{ top: imgTops[i], borderColor: '#f59e0b', background: 'var(--bg-display)' }}
          title={`Image ${i + 1} — connect an image here`}
        />
      ))}

      {/* Handle labels */}
      <div style={{ position: 'absolute', left: -62, top: TEXT_TOP - 8, display: 'flex', flexDirection: 'column', pointerEvents: 'none' }}>
        <div style={{ height: HANDLE_SPACING, display: 'flex', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Ask</span>
        </div>
        {IMAGE_HANDLE_IDS.map((_, i) => (
          <div key={i} style={{ height: HANDLE_SPACING, display: 'flex', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, color: 'var(--text-dim)', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Img {i + 1}</span>
          </div>
        ))}
      </div>

      <NodeWrapper id={id} label="Brain" dotColor="var(--accent)" tooltip="Ask a question — connect text and images, get an answer" minWidth={300}>
        {/* Answer area */}
        <label className="gs-label">Answer</label>
        <div
          className={`gs-output${nodeData.isGenerating ? ' streaming' : ''}`}
          style={{ minHeight: 80, maxHeight: 240, marginBottom: 10 }}
        >
          {nodeData.output
            ? <span className={nodeData.isGenerating ? 'cursor-blink' : ''}>{nodeData.output}</span>
            : <span style={{ color: 'var(--text-dim)', fontSize: 11 }}>
                {nodeData.isGenerating ? 'Thinking…' : 'Connect a text node to "Ask", then hit the button below'}
              </span>
          }
        </div>

        {/* Ask button */}
        <button
          className="gs-btn"
          onClick={handleAsk}
          disabled={nodeData.isGenerating}
          style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
        >
          {nodeData.isGenerating
            ? <><Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> Thinking…</>
            : <><Brain size={12} /> Ask</>
          }
        </button>

        {/* Copy + Advanced in a row */}
        <div style={{ display: 'flex', gap: 6 }}>
          {nodeData.output && (
            <button
              onClick={handleCopy}
              className="gs-btn-ghost"
              style={{ flex: 1, justifyContent: 'center', fontSize: 9 }}
            >
              <Copy size={10} style={{ marginRight: 4 }} />
              {copySuccess ? 'Copied!' : 'Copy answer'}
            </button>
          )}
          <button
            onClick={() => setAdvancedOpen((v) => !v)}
            className="gs-btn-ghost"
            style={{ flex: nodeData.output ? undefined : 1, justifyContent: 'center', fontSize: 9, padding: '6px 10px' }}
          >
            {advancedOpen ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
            <span style={{ marginLeft: 4 }}>Advanced</span>
          </button>
        </div>

        {/* Advanced panel — speed + personality */}
        {advancedOpen && (
          <div style={{ marginTop: 10, borderTop: '1px solid var(--border-base)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div>
              <label className="gs-label">Speed vs Detail</label>
              <select
                className="gs-select"
                value={nodeData.model || DEFAULT_MODEL}
                onChange={(e) => updateNodeData(id, { model: e.target.value })}
              >
                {ADVANCED_MODELS.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="gs-label">Personality / instructions</label>
              <textarea
                className="gs-textarea"
                value={nodeData.systemPrompt}
                onChange={(e) => updateNodeData(id, { systemPrompt: e.target.value })}
                placeholder="e.g. You are a friendly brand expert who keeps answers short and punchy."
                rows={3}
                style={{ minHeight: 70 }}
              />
            </div>
          </div>
        )}

        {!apiKey && (
          <p style={{ marginTop: 8, fontSize: 9, fontFamily: 'var(--font-display)', color: '#f59e0b', textAlign: 'center', letterSpacing: '0.06em' }}>
            No key yet — open Settings ⚙ to connect
          </p>
        )}
      </NodeWrapper>

      <TooltipHandle
        type="source" position={Position.Right} id="text-output"
        tooltip="Answer — connect to another Brain or Text node"
        style={{ top: '50%', borderColor: 'var(--accent)', background: 'var(--bg-display)' }}
      />

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export default memo(GeminiNode)
