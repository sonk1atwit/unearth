import { useState } from 'react'

const MOCK_RESULTS = [
  { source: 'Spokeo', type: 'People Search', status: 'found', detail: 'Name, address, phone number listed publicly.' },
  { source: 'WhitePages', type: 'People Search', status: 'found', detail: 'Full name and city visible in directory.' },
  { source: 'BeenVerified', type: 'Background Check', status: 'found', detail: 'Age, relatives, and past addresses exposed.' },
  { source: 'LinkedIn', type: 'Social Media', status: 'found', detail: 'Public profile with employer and location.' },
  { source: 'Facebook', type: 'Social Media', status: 'not_found', detail: 'No matching public profile found.' },
  { source: 'Intelius', type: 'Data Broker', status: 'found', detail: 'Phone number and email address listed.' },
  { source: 'PeopleFinder', type: 'Data Broker', status: 'not_found', detail: 'No record found.' },
]

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
    }, 1800)
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
        <form onSubmit={handleScan} className={`flex flex-col sm:flex-row gap-3 transition-opacity duration-300 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 bg-white/80 backdrop-blur-sm border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all duration-200"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="flex-1 bg-white/80 backdrop-blur-sm border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-200 transition-all duration-200"
          />
          <button
            type="submit"
            disabled={loading}
            className="text-white font-semibold px-6 py-2 rounded-lg text-sm shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50"
            style={{ backgroundColor: '#5a6e2c' }}
          >
            {loading ? 'Scanning...' : 'Scan'}
          </button>
        </form>

        {loading && (
          <div className="mt-3 h-0.5 rounded-full overflow-hidden bg-stone-200">
            <div
              className="animate-scan-line h-full w-1/4 rounded-full"
              style={{ background: 'linear-gradient(to right, transparent, #5a6e2c, transparent)' }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
