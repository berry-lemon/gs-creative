import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from '@xyflow/react'
import { downloadJson, getShareUrl, loadFromHash } from '../lib/storage'

let nodeIdCounter = 1

function generateId(): string {
  return `node-${Date.now()}-${nodeIdCounter++}`
}

function getDefaultData(type: string): Record<string, unknown> {
  switch (type) {
    case 'textNode':
      return { text: '' }
    case 'imageUploadNode':
      return { base64: '', mimeType: 'image/png', fileName: '' }
    case 'logoNode':
      return { base64: '', mimeType: 'image/png', fileName: '' }
    case 'colorPaletteNode':
      return { colors: ['#00d4b4', '#a78bfa', '#f59e0b'] }
    case 'fontNode':
      return { fontName: 'Inter', preview: 'The quick brown fox' }
    case 'geminiNode':
      return {
        systemPrompt: '',
        model: 'gemini-2.0-flash',
        output: '',
        isGenerating: false,
      }
    case 'imageOutputNode':
      return { src: '', alt: '' }
    default:
      return {}
  }
}

interface StoreState {
  nodes: Node[]
  edges: Edge[]
  apiKey: string
  settingsOpen: boolean
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  addNode: (type: string, position: { x: number; y: number }) => void
  updateNodeData: (id: string, data: Record<string, unknown>) => void
  setApiKey: (key: string) => void
  toggleSettings: () => void
  exportCanvas: () => void
  importCanvas: (jsonStr: string) => void
  getShareUrl: () => void
  loadFromUrl: () => void
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      apiKey: '',
      settingsOpen: false,

      onNodesChange: (changes) => {
        set((state) => ({
          nodes: applyNodeChanges(changes, state.nodes),
        }))
      },

      onEdgesChange: (changes) => {
        set((state) => ({
          edges: applyEdgeChanges(changes, state.edges),
        }))
      },

      onConnect: (connection) => {
        set((state) => ({
          edges: addEdge(
            {
              ...connection,
              type: 'default',
              animated: true,
              style: { stroke: '#00d4b4', strokeWidth: 2 },
            },
            state.edges
          ),
        }))
      },

      addNode: (type, position) => {
        const newNode: Node = {
          id: generateId(),
          type,
          position,
          data: getDefaultData(type),
        }
        set((state) => ({ nodes: [...state.nodes, newNode] }))
      },

      updateNodeData: (id, data) => {
        set((state) => ({
          nodes: state.nodes.map((n) =>
            n.id === id ? { ...n, data: { ...n.data, ...data } } : n
          ),
        }))
      },

      setApiKey: (key) => {
        set({ apiKey: key })
      },

      toggleSettings: () => {
        set((state) => ({ settingsOpen: !state.settingsOpen }))
      },

      exportCanvas: () => {
        const { nodes, edges } = get()
        downloadJson({ nodes, edges })
      },

      importCanvas: (jsonStr) => {
        try {
          const data = JSON.parse(jsonStr) as { nodes: Node[]; edges: Edge[] }
          if (Array.isArray(data.nodes) && Array.isArray(data.edges)) {
            set({ nodes: data.nodes, edges: data.edges })
          }
        } catch {
          alert('Invalid canvas file')
        }
      },

      getShareUrl: () => {
        const { nodes, edges } = get()
        const url = getShareUrl({ nodes, edges })
        navigator.clipboard.writeText(url).then(() => {
          alert('Share URL copied to clipboard!')
        }).catch(() => {
          prompt('Copy this URL:', url)
        })
      },

      loadFromUrl: () => {
        const data = loadFromHash()
        if (data) {
          set({ nodes: data.nodes, edges: data.edges })
          window.location.hash = ''
        }
      },
    }),
    {
      name: 'gs-creative-store',
      partialize: (state) => ({
        nodes: state.nodes,
        edges: state.edges,
        apiKey: state.apiKey,
      }),
    }
  )
)
