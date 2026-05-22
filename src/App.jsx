import { useState } from 'react'
import Navbar from './components/Navbar'
import ScanForm from './components/ScanForm'
import Dashboard from './components/Dashboard'

export default function App() {
  const [scanResults, setScanResults] = useState(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-10">
        <ScanForm onResults={setScanResults} />
        {scanResults && <Dashboard results={scanResults} />}
      </main>
    </div>
  )
}
