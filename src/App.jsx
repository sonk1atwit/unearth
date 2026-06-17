import { useState } from 'react'
import Navbar from './components/Navbar'
import ScanForm from './components/ScanForm'
import Dashboard from './components/Dashboard'
import Onboarding from './components/Onboarding'

export default function App() {
  const [started, setStarted] = useState(false)
  const [scanResults, setScanResults] = useState(null)

  function goHome() {
    setStarted(false)
    setScanResults(null)
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-animated text-stone-800">
        <Navbar onHome={goHome} />
        <Onboarding onStart={() => setStarted(true)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-animated text-stone-800">
      <Navbar onHome={goHome} />
      <div className="dot-grid min-h-[calc(100vh-52px)]">
        <main className="max-w-4xl mx-auto px-4 py-10">
          <ScanForm onResults={setScanResults} />
          {scanResults && <Dashboard results={scanResults} />}
        </main>
      </div>
    </div>
  )
}
