import { useState, useEffect } from 'react'

const MOCK_RESULTS = [
  { source: 'Spokeo', type: 'People Search', status: 'found', detail: 'Name, address, phone number listed publicly.' },
  { source: 'WhitePages', type: 'People Search', status: 'found', detail: 'Full name and city visible in directory.' },
  { source: 'BeenVerified', type: 'Background Check', status: 'found', detail: 'Age, relatives, and past addresses exposed.' },
  { source: 'LinkedIn', type: 'Social Media', status: 'found', detail: 'Public profile with employer and location.' },
  { source: 'Facebook', type: 'Social Media', status: 'not_found', detail: 'No matching public profile found.' },
  { source: 'Intelius', type: 'Data Broker', status: 'found', detail: 'Phone number and email address listed.' },
  { source: 'PeopleFinder', type: 'Data Broker', status: 'not_found', detail: 'No record found.' },
]

const SCAN_MESSAGES = [
  'Searching Spokeo...',
  'Checking WhitePages...',
  'Scanning BeenVerified...',
  'Querying LinkedIn...',
  'Checking Facebook...',
  'Digging through Intelius...',
  'Scanning PeopleFinder...',
  'Compiling results...',
]

const BLIPS = [
  { top: '18%', left: '68%', delay: '0.2s' },
  { top: '62%', left: '22%', delay: '0.9s' },
  { top: '72%', left: '63%', delay: '1.4s' },
  { top: '28%', left: '38%', delay: '0.5s' },
  { top: '50%', left: '78%', delay: '1.1s' },
]

function DiggingLoader() {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setMsgIndex(i => (i + 1) % SCAN_MESSAGES.length)
    }, 450)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div className="relative w-44 h-44">
        {/* Concentric rings */}
        <div className="absolute inset-0 rounded-full border border-stone-300/70" />
        <div className="absolute inset-[18px] rounded-full border border-stone-200/60" />
        <div className="absolute inset-[36px] rounded-full border border-stone-200/40" />

        {/* Crosshairs */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-stone-300/30" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-px bg-stone-300/30" />
        </div>

        {/* Radar sweep */}
        <div
          className="absolute inset-0 rounded-full animate-radar-sweep"
          style={{
            background: 'conic-gradient(rgba(90,110,44,0.5) 0deg, rgba(90,110,44,0.08) 65deg, transparent 90deg)'
          }}
        />

        {/* Outer ping */}
        <div
          className="absolute inset-0 rounded-full border animate-ping"
          style={{ borderColor: 'rgba(90,110,44,0.25)', animationDuration: '2s' }}
        />

        {/* Data blips */}
        {BLIPS.map((blip, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-ping"
            style={{
              top: blip.top,
              left: blip.left,
              backgroundColor: '#5a6e2c',
              animationDelay: blip.delay,
              animationDuration: '2s',
            }}
          />
        ))}

        {/* Center dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5a6e2c' }} />
        </div>
      </div>

      <div className="text-center">
        <p className="text-xs text-stone-400 mb-1">Digging through public records</p>
        <p
          key={msgIndex}
          className="animate-fade-slide-up text-sm font-medium text-stone-700"
        >
          {SCAN_MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  )
}

export default function ScanForm({ onResults }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  function handleScan(e) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      onResults(MOCK_RESULTS)
    }, 3600)
  }

  return (
    <div className="mb-10">
      <h1 className="animate-fade-slide-up text-3xl font-bold mb-2 text-stone-800" style={{ animationDelay: '50ms' }}>
        Find your digital footprint
      </h1>
      <p className="animate-fade-slide-up text-stone-500 mb-6 text-sm" style={{ animationDelay: '150ms' }}>
        Enter your details below to scan public data sources for your personal information.
      </p>

      <div className="animate-fade-slide-up" style={{ animationDelay: '250ms' }}>
        {loading ? (
          <DiggingLoader />
        ) : (
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="flex-1 bg-white/80 backdrop-blur-sm border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Email (optional)"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="flex-1 bg-white/80 backdrop-blur-sm border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all duration-200"
            />
            <button
              type="submit"
              className="text-white font-semibold px-6 py-2 rounded-lg text-sm shadow-sm hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#5a6e2c' }}
            >
              Scan
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
