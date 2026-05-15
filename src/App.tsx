import Canvas from './components/Canvas'
import SettingsPanel from './components/SettingsPanel'

export default function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#0d0d0d' }}>
      <Canvas />
      <SettingsPanel />
    </div>
  )
}
