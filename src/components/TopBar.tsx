import { useRef } from 'react'
import { Settings, Download, Upload, Share2, Sun, Moon, Sparkles } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function TopBar() {
  const exportCanvas  = useStore((s) => s.exportCanvas)
  const importCanvas  = useStore((s) => s.importCanvas)
  const getShareUrl   = useStore((s) => s.getShareUrl)
  const toggleSettings = useStore((s) => s.toggleSettings)
  const toggleTheme   = useStore((s) => s.toggleTheme)
  const theme         = useStore((s) => s.theme)
  const fileInputRef  = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => importCanvas(ev.target?.result as string)
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0, left: 58, right: 0,
        height: 48,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-base)',
        boxShadow: 'inset 0 -1px 0 var(--border-hi)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 16,
        paddingRight: 12,
        gap: 8,
        zIndex: 10,
      }}
    >
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
        <Sparkles size={13} style={{ color: 'var(--accent)' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
          GS Creative
        </span>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: 8,
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          background: 'var(--accent-bg)',
          border: '1px solid var(--border-hi)',
          borderRadius: 4,
          padding: '2px 7px',
        }}>
          Studio
        </span>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <TbBtn onClick={exportCanvas} icon={<Download size={12} />} label="Export" title="Export canvas as JSON file" />
        <TbBtn onClick={() => fileInputRef.current?.click()} icon={<Upload size={12} />} label="Import" title="Import canvas from JSON file" />
        <TbBtn onClick={getShareUrl} icon={<Share2 size={12} />} label="Share" title="Copy shareable URL to clipboard" accent />

        <div style={{ width: 1, height: 22, background: 'var(--border-base)', margin: '0 4px' }} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--border-base)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => { const b = e.currentTarget; b.style.background = 'var(--accent-bg)'; b.style.color = 'var(--accent)'; b.style.borderColor = 'var(--border-hi)' }}
          onMouseLeave={(e) => { const b = e.currentTarget; b.style.background = 'transparent'; b.style.color = 'var(--text-muted)'; b.style.borderColor = 'var(--border-base)' }}
        >
          {theme === 'dark' ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        {/* Settings */}
        <button
          onClick={toggleSettings}
          title="Open settings"
          style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--border-base)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.12s',
          }}
          onMouseEnter={(e) => { const b = e.currentTarget; b.style.background = 'var(--accent-bg)'; b.style.color = 'var(--accent)'; b.style.borderColor = 'var(--border-hi)' }}
          onMouseLeave={(e) => { const b = e.currentTarget; b.style.background = 'transparent'; b.style.color = 'var(--text-muted)'; b.style.borderColor = 'var(--border-base)' }}
        >
          <Settings size={13} />
        </button>
      </div>

      <input ref={fileInputRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleFileChange} />
    </div>
  )
}

function TbBtn({ onClick, icon, label, title, accent = false }: { onClick: () => void; icon: React.ReactNode; label: string; title: string; accent?: boolean }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        height: 30,
        borderRadius: 8,
        background: accent ? 'var(--accent-bg)' : 'transparent',
        border: `1px solid ${accent ? 'var(--border-hi)' : 'var(--border-base)'}`,
        color: accent ? 'var(--accent)' : 'var(--text-muted)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 5,
        padding: '0 10px',
        fontFamily: 'var(--font-display)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        transition: 'all 0.12s',
      }}
      onMouseEnter={(e) => { const b = e.currentTarget; b.style.background = 'var(--accent-bg-hover)'; b.style.color = 'var(--accent)'; b.style.borderColor = 'var(--border-hi)'; b.style.boxShadow = `0 0 10px var(--accent-glow)` }}
      onMouseLeave={(e) => { const b = e.currentTarget; b.style.background = accent ? 'var(--accent-bg)' : 'transparent'; b.style.color = accent ? 'var(--accent)' : 'var(--text-muted)'; b.style.borderColor = accent ? 'var(--border-hi)' : 'var(--border-base)'; b.style.boxShadow = 'none' }}
    >
      {icon}{label}
    </button>
  )
}
