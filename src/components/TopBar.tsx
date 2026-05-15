import { useRef } from 'react'
import { Settings, Download, Upload, Share2, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function TopBar() {
  const exportCanvas = useStore((s) => s.exportCanvas)
  const importCanvas = useStore((s) => s.importCanvas)
  const getShareUrl = useStore((s) => s.getShareUrl)
  const toggleSettings = useStore((s) => s.toggleSettings)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      importCanvas(text)
    }
    reader.readAsText(file)
    // Reset so same file can be re-imported
    e.target.value = ''
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 56,
        right: 0,
        height: 48,
        background: '#111111',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 12,
        gap: 8,
        zIndex: 10,
      }}
    >
      {/* App name */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Sparkles size={14} color="#00d4b4" />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: '#e5e5e5',
              letterSpacing: '-0.02em',
            }}
          >
            GS Creative
          </span>
          <span
            style={{
              fontSize: 10,
              fontWeight: 500,
              color: '#00d4b4',
              background: 'rgba(0, 212, 180, 0.1)',
              border: '1px solid rgba(0, 212, 180, 0.2)',
              borderRadius: 4,
              padding: '1px 6px',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            Studio
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <TopBarButton onClick={exportCanvas} icon={<Download size={13} />} label="Export" />
        <TopBarButton onClick={handleImportClick} icon={<Upload size={13} />} label="Import" />
        <TopBarButton onClick={getShareUrl} icon={<Share2 size={13} />} label="Share" accent />
        <div style={{ width: 1, height: 24, background: '#1e1e1e', margin: '0 4px' }} />
        <button
          onClick={toggleSettings}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: 'transparent',
            border: '1px solid #2a2a2a',
            color: '#6b7280',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = '#1e1e1e'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#e5e5e5'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#3a3a3a'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#6b7280'
            ;(e.currentTarget as HTMLButtonElement).style.borderColor = '#2a2a2a'
          }}
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />
    </div>
  )
}

interface TopBarButtonProps {
  onClick: () => void
  icon: React.ReactNode
  label: string
  accent?: boolean
}

function TopBarButton({ onClick, icon, label, accent = false }: TopBarButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        height: 32,
        borderRadius: 8,
        background: accent ? 'rgba(0, 212, 180, 0.1)' : 'transparent',
        border: `1px solid ${accent ? 'rgba(0, 212, 180, 0.3)' : '#2a2a2a'}`,
        color: accent ? '#00d4b4' : '#9ca3af',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '0 10px',
        fontSize: 12,
        fontWeight: 500,
        fontFamily: 'Inter, sans-serif',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        const btn = e.currentTarget as HTMLButtonElement
        if (accent) {
          btn.style.background = 'rgba(0, 212, 180, 0.2)'
          btn.style.borderColor = '#00d4b4'
        } else {
          btn.style.background = '#1e1e1e'
          btn.style.color = '#e5e5e5'
          btn.style.borderColor = '#3a3a3a'
        }
      }}
      onMouseLeave={(e) => {
        const btn = e.currentTarget as HTMLButtonElement
        if (accent) {
          btn.style.background = 'rgba(0, 212, 180, 0.1)'
          btn.style.borderColor = 'rgba(0, 212, 180, 0.3)'
        } else {
          btn.style.background = 'transparent'
          btn.style.color = '#9ca3af'
          btn.style.borderColor = '#2a2a2a'
        }
      }}
    >
      {icon}
      {label}
    </button>
  )
}
