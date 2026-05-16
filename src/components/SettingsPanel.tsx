import { useState, useCallback } from 'react'
import { Eye, EyeOff, X, ExternalLink } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function SettingsPanel() {
  const settingsOpen   = useStore((s) => s.settingsOpen)
  const apiKey         = useStore((s) => s.apiKey)
  const setApiKey      = useStore((s) => s.setApiKey)
  const toggleSettings = useStore((s) => s.toggleSettings)

  const [draft, setDraft] = useState(apiKey)
  const [show, setShow]   = useState(false)

  const save = useCallback(() => {
    setApiKey(draft.trim())
    toggleSettings()
  }, [draft, setApiKey, toggleSettings])

  if (!settingsOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={toggleSettings}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49, backdropFilter: 'blur(2px)' }}
      />

      {/* Panel */}
      <div
        className="settings-panel-mobile"
        style={{
          position: 'fixed',
          top: 0, right: 0, bottom: 0,
          width: 340,
          maxWidth: '100vw',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-base)',
          boxShadow: 'var(--node-bevel), -8px 0 40px rgba(0,0,0,0.5)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-base)',
            background: 'linear-gradient(90deg, var(--accent-bg) 0%, transparent 100%)',
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-primary)', flex: 1 }}>
            Settings
          </span>
          <button
            onClick={toggleSettings}
            style={{ width: 26, height: 26, borderRadius: '50%', background: 'transparent', border: '1px solid var(--border-base)', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.12s' }}
            onMouseEnter={(e) => { (e.currentTarget).style.borderColor = '#ff5555'; (e.currentTarget).style.color = '#ff5555' }}
            onMouseLeave={(e) => { (e.currentTarget).style.borderColor = 'var(--border-base)'; (e.currentTarget).style.color = 'var(--text-muted)' }}
          >
            <X size={12} />
          </button>
        </div>

        <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* API Key section */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f59e0b', boxShadow: '0 0 5px #f59e0b' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Gemini API Key
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
              Required for the Gemini node. Keys are stored only in your browser's local storage and sent directly to Google's API.
            </p>

            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <input
                  className="gs-input"
                  type={show ? 'text' : 'password'}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') save() }}
                  placeholder="AIza…"
                  style={{ paddingRight: 36 }}
                />
                <button
                  onClick={() => setShow((v) => !v)}
                  style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                  title={show ? 'Hide key' : 'Show key'}
                >
                  {show ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              <button className="gs-btn" onClick={save} style={{ flexShrink: 0 }}>
                Save
              </button>
            </div>

            {apiKey && (
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 5px var(--accent)' }} />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Key stored
                </span>
              </div>
            )}
          </section>

          <hr className="gs-divider" />

          {/* Help */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', boxShadow: '0 0 5px #6366f1' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Get a Key
              </span>
            </div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10 }}>
              Get a free Gemini API key from Google AI Studio. The free tier supports Gemini 2.0 Flash with generous limits.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', textDecoration: 'none' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textShadow = '0 0 8px var(--accent)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textShadow = 'none' }}
            >
              Google AI Studio <ExternalLink size={10} />
            </a>
          </section>

          <hr className="gs-divider" />

          {/* Keyboard shortcuts */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981' }} />
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-primary)' }}>
                Shortcuts
              </span>
            </div>
            {[
              ['Delete / Backspace', 'Remove selected node or edge'],
              ['Scroll', 'Zoom in / out'],
              ['Space + drag', 'Pan canvas'],
              ['Ctrl + Z', 'Undo node changes'],
            ].map(([key, desc]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 8, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>{desc}</span>
                <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 9, background: 'var(--bg-display)', border: '1px solid var(--border-base)', borderRadius: 4, padding: '2px 6px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  {key}
                </kbd>
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  )
}
