import { useState, useEffect } from 'react'

const MOCK_RESULTS = [
  { source: 'Spokeo',           type: 'People Search',    status: 'found',     detail: 'Name, address, phone number listed publicly.' },
  { source: 'WhitePages',       type: 'People Search',    status: 'found',     detail: 'Full name and city visible in directory.' },
  { source: 'FastPeopleSearch', type: 'People Search',    status: 'found',     detail: 'Full name, age, and address listed.' },
  { source: 'Radaris',          type: 'People Search',    status: 'found',     detail: 'Name, location, and relatives listed publicly.' },
  { source: 'ZabaSearch',       type: 'People Search',    status: 'not_found', detail: 'No record found.' },
  { source: 'MyLife',           type: 'People Search',    status: 'not_found', detail: 'No matching profile found.' },
  { source: 'BeenVerified',     type: 'Background Check', status: 'found',     detail: 'Age, relatives, and past addresses exposed.' },
  { source: 'TruthFinder',      type: 'Background Check', status: 'found',     detail: 'Background report with address history available.' },
  { source: 'Instant Checkmate',type: 'Background Check', status: 'not_found', detail: 'No record found.' },
  { source: 'LinkedIn',         type: 'Social Media',     status: 'found',     detail: 'Public profile with employer and location.' },
  { source: 'Facebook',         type: 'Social Media',     status: 'not_found', detail: 'No matching public profile found.' },
  { source: 'Twitter/X',        type: 'Social Media',     status: 'not_found', detail: 'No public account found.' },
  { source: 'Intelius',         type: 'Data Broker',      status: 'found',     detail: 'Phone number and email address listed.' },
  { source: 'PeopleFinder',     type: 'Data Broker',      status: 'found',     detail: 'Name and address listed in public records.' },
]

const SCAN_MESSAGES = [
  'Searching Spokeo...',
  'Checking WhitePages...',
  'Scanning FastPeopleSearch...',
  'Digging through Radaris...',
  'Checking ZabaSearch...',
  'Scanning MyLife...',
  'Checking BeenVerified...',
  'Scanning TruthFinder...',
  'Checking Instant Checkmate...',
  'Querying LinkedIn...',
  'Checking Facebook...',
  'Scanning Twitter/X...',
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
        <div className="absolute inset-0 rounded-full border border-stone-300/70" />
        <div className="absolute inset-[18px] rounded-full border border-stone-200/60" />
        <div className="absolute inset-[36px] rounded-full border border-stone-200/40" />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-px bg-stone-300/30" />
        </div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="h-full w-px bg-stone-300/30" />
        </div>
        <div
          className="absolute inset-0 rounded-full animate-radar-sweep"
          style={{ background: 'conic-gradient(rgba(90,110,44,0.5) 0deg, rgba(90,110,44,0.08) 65deg, transparent 90deg)' }}
        />
        <div
          className="absolute inset-0 rounded-full border animate-ping"
          style={{ borderColor: 'rgba(90,110,44,0.25)', animationDuration: '2s' }}
        />
        {BLIPS.map((blip, i) => (
          <div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full animate-ping"
            style={{ top: blip.top, left: blip.left, backgroundColor: '#5a6e2c', animationDelay: blip.delay, animationDuration: '2s' }}
          />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#5a6e2c' }} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs text-stone-400 mb-1">Digging through public records</p>
        <p key={msgIndex} className="animate-fade-slide-up text-sm font-medium text-stone-700">
          {SCAN_MESSAGES[msgIndex]}
        </p>
      </div>
    </div>
  )
}

function ScanError({ onRetry }) {
  return (
    <div className="flex flex-col items-center gap-3 py-10 text-center animate-fade-slide-up">
      <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-400 text-xl">✕</div>
      <p className="font-medium text-stone-700">Scan failed</p>
      <p className="text-sm text-stone-400 max-w-xs">Something went wrong while scanning. Please check your connection and try again.</p>
      <button
        onClick={onRetry}
        className="mt-1 text-sm font-medium px-5 py-2 rounded-lg text-white hover:opacity-90 transition-opacity"
        style={{ backgroundColor: '#5a6e2c' }}
      >
        Try again
      </button>
    </div>
  )
}

export default function ScanForm({ onResults }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [scanFailed, setScanFailed] = useState(false)

  async function handleScan(e) {
    e.preventDefault()
    if (!name.trim() && !email.trim()) {
      setError('Please enter a name or email to start the scan.')
      return
    }
    setError('')
    setScanFailed(false)
    setLoading(true)

    try {
      const requests = []
      if (name.trim()) {
        requests.push(fetch(`/api/batch-user?service_type=all&query=${encodeURIComponent(name.trim())}`))
      }
      if (email.trim()) {
        requests.push(fetch(`/api/batch-email?service_type=all&query=${encodeURIComponent(email.trim())}`))
      }

      const responses = await Promise.all(requests)
      for (const res of responses) {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
      }

      const jsonResults = await Promise.all(responses.map(r => r.json()))

      const combined = []
      const seen = new Set()

      for (const data of jsonResults) {
        const items = Array.isArray(data) ? data.slice(1) : []
        for (const item of items) {
          const key = item.site_name
          if (seen.has(key)) continue
          seen.add(key)
          combined.push({
            source: item.site_name,
            type: item.category || 'Other',
            status: (item.status === 'Found' || item.status === 'Registered') ? 'found' : 'not_found',
            url: item.url || null,
            detail: item.reason || (item.url ? 'Listed in public records.' : 'No additional details.'),
          })
        }
      }

      setLoading(false)
      onResults(combined)
    } catch {
      setLoading(false)
      setScanFailed(true)
    }
  }

  function handleRetry() {
    setScanFailed(false)
    setLoading(false)
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
        {scanFailed ? (
          <ScanError onRetry={handleRetry} />
        ) : loading ? (
          <DiggingLoader />
        ) : (
          <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Name or username"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              className={`flex-1 bg-white/80 backdrop-blur-sm border rounded-lg px-4 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 transition-all duration-200 ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-stone-300 focus:border-stone-500 focus:ring-stone-200'}`}
            />
            <input
              type="text"
              placeholder="Email"
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
        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
      </div>
    </div>
  )
}
