import { memo, useCallback, useRef, useState, useEffect } from 'react'
import { Position, type NodeProps, useReactFlow } from '@xyflow/react'
import { Plus, X, Wand2, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import NodeWrapper from '../components/NodeWrapper'
import TooltipHandle from '../components/TooltipHandle'
import { extractColors, normalizeHex, isValidHex } from '../lib/colors'

interface ColorPaletteData { colors: string[] }
interface ImageData { base64: string; mimeType: string }

const MAX_COLORS = 6

function ColorPaletteNode({ id, data }: NodeProps) {
  const { colors } = data as unknown as ColorPaletteData
  const updateNodeData = useStore((s) => s.updateNodeData)
  const { getEdges, getNode } = useReactFlow()
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [hexInput, setHexInput] = useState('')
  const [hexError, setHexError] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const prevBase64Ref = useRef('')

  const update = useCallback(
    (next: string[]) => updateNodeData(id, { colors: next.slice(0, MAX_COLORS) }),
    [id, updateNodeData]
  )

  const updateColor = useCallback((index: number, value: string) => {
    const next = [...colors]
    next[index] = value
    update(next)
  }, [colors, update])

  const removeColor = useCallback((index: number) => {
    update(colors.filter((_, i) => i !== index))
  }, [colors, update])

  const addPickerColor = useCallback(() => {
    if (colors.length >= MAX_COLORS) return
    update([...colors, '#76ff03'])
  }, [colors, update])

  const addHexColor = useCallback(() => {
    if (colors.length >= MAX_COLORS) return
    const normalized = normalizeHex(hexInput)
    if (!isValidHex(normalized)) {
      setHexError(true)
      setTimeout(() => setHexError(false), 1200)
      return
    }
    update([...colors, normalized])
    setHexInput('')
  }, [hexInput, colors, update])

  const syncFromImage = useCallback(async () => {
    const edges = getEdges()
    const incoming = edges.find((e) => e.target === id)
    if (!incoming) return
    const src = getNode(incoming.source)
    if (!src) return
    const imgData = src.data as unknown as ImageData
    if (!imgData?.base64) return

    setSyncing(true)
    try {
      const extracted = await extractColors(imgData.base64, 3)
      if (extracted.length === 0) return
      const merged = [...colors, ...extracted].slice(0, MAX_COLORS)
      update(merged)
    } finally {
      setSyncing(false)
    }
  }, [id, colors, getEdges, getNode, update])

  // Detect connected image (read at render time so the effect can react to it)
  const edges = getEdges()
  const incomingEdge = edges.find((e) => e.target === id)
  const incomingSrc = incomingEdge ? getNode(incomingEdge.source) : null
  const connectedBase64 = (incomingSrc?.data as unknown as ImageData)?.base64 ?? ''
  const hasImage = !!connectedBase64

  // Keep a ref to current colors so the auto-extract effect always has fresh values
  const colorsRef = useRef(colors)
  colorsRef.current = colors

  // Auto-extract when a new image is connected or the image changes
  useEffect(() => {
    if (!connectedBase64 || connectedBase64 === prevBase64Ref.current) return
    prevBase64Ref.current = connectedBase64
    setSyncing(true)
    extractColors(connectedBase64, 3).then((extracted) => {
      if (extracted.length === 0) return
      const current = colorsRef.current
      const unique = extracted.filter((c) => !current.includes(c))
      if (unique.length === 0) return
      updateNodeData(id, { colors: [...current, ...unique].slice(0, MAX_COLORS) })
    }).finally(() => setSyncing(false))
  }, [connectedBase64, id, updateNodeData])

  return (
    <NodeWrapper id={id} label="Palette" dotColor="#f59e0b" tooltip="Define brand colors — type hex codes or sync from a connected image" minWidth={272}>
      {/* Image input handle */}
      <TooltipHandle
        type="target"
        position={Position.Left}
        id="image-input"
        tooltip="Image input → extract colors"
        style={{ borderColor: '#f59e0b' }}
      />

      {/* Swatches */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        {colors.map((color, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <div
              onClick={() => inputRefs.current[i]?.click()}
              style={{
                width: 38, height: 38, borderRadius: 8,
                background: color, cursor: 'pointer',
                border: '2px solid rgba(255,255,255,0.12)',
                boxShadow: `0 0 8px ${color}55`,
                transition: 'transform 0.12s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.12)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)' }}
              title={color}
            />
            <input
              ref={(el) => { inputRefs.current[i] = el }}
              type="color"
              value={color}
              onChange={(e) => updateColor(i, e.target.value)}
              style={{ position: 'absolute', opacity: 0, width: 0, height: 0, pointerEvents: 'none' }}
            />
            <button
              onClick={() => removeColor(i)}
              style={{
                position: 'absolute', top: -6, right: -6,
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--bg-node)', border: '1px solid var(--border-base)',
                color: 'var(--text-muted)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
              }}
              title="Remove"
            >
              <X size={8} />
            </button>
          </div>
        ))}
        {colors.length < MAX_COLORS && (
          <button
            onClick={addPickerColor}
            style={{
              width: 38, height: 38, borderRadius: 8,
              background: 'var(--bg-display)', border: '1px dashed var(--border-base)',
              color: 'var(--text-muted)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-base)'
              ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
            }}
            title="Add color via picker"
          >
            <Plus size={14} />
          </button>
        )}
      </div>

      {/* Hex input */}
      <label className="gs-label">Add by hex</label>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <input
          className="gs-input"
          value={hexInput}
          onChange={(e) => setHexInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') addHexColor() }}
          placeholder="#76ff03"
          maxLength={7}
          style={{
            flex: 1,
            fontFamily: 'var(--font-mono)',
            borderColor: hexError ? '#ff5555' : undefined,
            color: hexError ? '#ff5555' : undefined,
          }}
          disabled={colors.length >= MAX_COLORS}
        />
        <button
          className="gs-btn-ghost"
          onClick={addHexColor}
          disabled={colors.length >= MAX_COLORS}
          style={{ flexShrink: 0, padding: '6px 12px' }}
        >
          Add
        </button>
      </div>

      {/* Sync from image */}
      <button
        onClick={syncFromImage}
        disabled={!hasImage || syncing || colors.length >= MAX_COLORS}
        className="gs-btn-ghost"
        style={{
          width: '100%',
          justifyContent: 'center',
          opacity: hasImage ? 1 : 0.4,
          cursor: hasImage && !syncing ? 'pointer' : 'not-allowed',
        }}
        title={hasImage ? 'Pull 3 colors from connected image' : 'Connect an image to enable'}
      >
        {syncing
          ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Extracting…</>
          : <><Wand2 size={11} /> Sync from image</>
        }
      </button>

      <p style={{ marginTop: 8, fontSize: 9, color: 'var(--text-dim)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        {colors.length} / {MAX_COLORS} colors
      </p>

      <TooltipHandle
        type="source"
        position={Position.Right}
        id="palette-output"
        tooltip="Colors (JSON array)"
        style={{ borderColor: '#f59e0b' }}
      />

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </NodeWrapper>
  )
}

export default memo(ColorPaletteNode)
