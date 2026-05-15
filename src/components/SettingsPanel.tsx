import { useState, useCallback } from 'react'
import { Eye, EyeOff, X, Key, ExternalLink } from 'lucide-react'
import { useStore } from '../store/useStore'

export default function SettingsPanel() {
  const settingsOpen = useStore((s) => s.settingsOpen)
  const toggleSettings = useStore((s) => s.toggleSettings)
  const apiKey = useStore((s) => s.apiKey)
  const setApiKey = useStore((s) => s.setApiKey)

  const [localKey, setLocalKey] = useState(apiKey)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(() => {
    setApiKey(localKey.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [localKey, setApiKey])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSave()
    },
    [handleSave]
  )

  if (!settingsOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={toggleSettings}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 50,
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 320,
          background: '#111111',
          borderLeft: '1px solid #1e1e1e',
          zIndex: 51,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #1e1e1e',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Key size={15} color="#00d4b4" />
            <h2
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 600,
                color: '#e5e5e5',
                letterSpacing: '-0.01em',
              }}
            >
              Settings
            </h2>
          </div>
          <button
            onClick={toggleSettings}
            style={{
              width: 28,
              height: 28,
              borderRadius: 7,
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
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#6b7280'
            }}
          >
            <X size={13} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* API Key section */}
          <div
            style={{
              background: '#161616',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <h3
              style={{
                margin: '0 0 6px',
                fontSize: 13,
                fontWeight: 600,
                color: '#e5e5e5',
              }}
            >
              Gemini API Key
            </h3>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6b7280', lineHeight: 1.6 }}>
              Required for the Gemini node to generate text. Your key is stored locally in your
              browser and never sent to our servers.
            </p>

            <label
              style={{
                display: 'block',
                fontSize: 10,
                fontWeight: 500,
                color: '#6b7280',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 6,
              }}
            >
              API Key
            </label>

            <div style={{ position: 'relative', marginBottom: 12 }}>
              <input
                type={showKey ? 'text' : 'password'}
                value={localKey}
                onChange={(e) => {
                  setLocalKey(e.target.value)
                  setSaved(false)
                }}
                onKeyDown={handleKeyDown}
                placeholder="AIza..."
                style={{
                  width: '100%',
                  background: '#0d0d0d',
                  border: '1px solid #2a2a2a',
                  borderRadius: 8,
                  color: '#e5e5e5',
                  fontFamily: 'Inter, monospace',
                  fontSize: 12,
                  padding: '8px 36px 8px 10px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s ease',
                }}
                onFocus={(e) => {
                  ;(e.currentTarget as HTMLInputElement).style.borderColor = '#00d4b4'
                  ;(e.currentTarget as HTMLInputElement).style.boxShadow =
                    '0 0 0 2px rgba(0,212,180,0.1)'
                }}
                onBlur={(e) => {
                  ;(e.currentTarget as HTMLInputElement).style.borderColor = '#2a2a2a'
                  ;(e.currentTarget as HTMLInputElement).style.boxShadow = 'none'
                }}
              />
              <button
                onClick={() => setShowKey((v) => !v)}
                style={{
                  position: 'absolute',
                  right: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6b7280',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 0,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#e5e5e5'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#6b7280'
                }}
              >
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>

            <button
              onClick={handleSave}
              style={{
                width: '100%',
                height: 36,
                borderRadius: 8,
                background: saved ? 'rgba(16, 185, 129, 0.2)' : '#00d4b4',
                border: saved ? '1px solid rgba(16, 185, 129, 0.4)' : 'none',
                color: saved ? '#10b981' : '#0d0d0d',
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {saved ? 'Saved!' : 'Save API Key'}
            </button>
          </div>

          {/* Get API key link */}
          <div
            style={{
              background: '#161616',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <p style={{ margin: '0 0 10px', fontSize: 12, color: '#9ca3af', lineHeight: 1.6 }}>
              Don't have an API key? Get one free from Google AI Studio.
            </p>
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                fontWeight: 500,
                color: '#00d4b4',
                textDecoration: 'none',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.opacity = '0.7'
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLAnchorElement).style.opacity = '1'
              }}
            >
              <ExternalLink size={12} />
              Google AI Studio
            </a>
          </div>

          {/* About */}
          <div
            style={{
              background: '#161616',
              border: '1px solid #2a2a2a',
              borderRadius: 12,
              padding: 14,
            }}
          >
            <h3
              style={{
                margin: '0 0 8px',
                fontSize: 12,
                fontWeight: 600,
                color: '#9ca3af',
              }}
            >
              About GS Creative Studio
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: '#4b5563', lineHeight: 1.7 }}>
              A visual AI node editor for creative workflows. Connect text prompts, images, logos,
              and fonts to Gemini AI to generate creative content. Export your canvas as JSON or
              share via URL.
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
