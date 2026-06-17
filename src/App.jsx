import { useState } from 'react'
import Navbar from './components/Navbar'
import ScanForm from './components/ScanForm'
import Dashboard from './components/Dashboard'
import Onboarding from './components/Onboarding'

function Footer() {
  return (
    <footer className="border-t border-stone-200/60 bg-white/40 backdrop-blur-sm px-4 py-4 text-center">
      <p className="text-xs text-stone-400">
        Unearth is open-source —{' '}
        <a
          href="https://github.com/sonk1atwit/unearth"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-stone-600 transition-colors duration-200"
        >
          view on GitHub
        </a>
      </p>
    </footer>
  )
}

export default function App() {
  const [started, setStarted] = useState(false)
  const [scanResults, setScanResults] = useState(null)

  function goHome() {
    setStarted(false)
    setScanResults(null)
  }

  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-animated text-stone-800 flex flex-col">
        <Navbar onHome={goHome} />
        <div className="flex-1">
          <Onboarding onStart={() => setStarted(true)} />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-animated text-stone-800 flex flex-col">
      <Navbar onHome={goHome} />
      <div className="dot-grid flex-1">
        <main className="max-w-4xl mx-auto px-4 py-10">
          <ScanForm onResults={setScanResults} />
          {scanResults && <Dashboard results={scanResults} />}
        </main>
      </div>
      <Footer />
    </div>
  )
}
