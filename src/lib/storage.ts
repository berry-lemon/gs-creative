import LZString from 'lz-string'
import type { Node, Edge } from '@xyflow/react'

export interface CanvasData {
  nodes: Node[]
  edges: Edge[]
}

export function compressCanvas(data: CanvasData): string {
  return LZString.compressToEncodedURIComponent(JSON.stringify(data))
}

export function decompressCanvas(compressed: string): CanvasData | null {
  try {
    const json = LZString.decompressFromEncodedURIComponent(compressed)
    if (!json) return null
    return JSON.parse(json) as CanvasData
  } catch {
    return null
  }
}

export function getShareUrl(data: CanvasData): string {
  const compressed = compressCanvas(data)
  const url = new URL(window.location.href)
  url.hash = `canvas=${compressed}`
  return url.toString()
}

export function loadFromHash(): CanvasData | null {
  const hash = window.location.hash
  if (!hash.startsWith('#canvas=')) return null
  const compressed = hash.slice('#canvas='.length)
  return decompressCanvas(compressed)
}

export function downloadJson(data: CanvasData): void {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `gs-creative-${Date.now()}.json`
  a.click()
  URL.revokeObjectURL(url)
}
