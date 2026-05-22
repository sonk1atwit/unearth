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
      <h1 className="text-3xl font-bold mb-2 text-stone-800">Find your digital footprint</h1>
      <p className="text-stone-500 mb-6 text-sm">
        Enter your details below to scan public data sources for your personal information.
      </p>
      <form onSubmit={handleScan} className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="flex-1 bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500"
        />
        <input
          type="email"
          placeholder="Email (optional)"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="flex-1 bg-white border border-stone-300 rounded-lg px-4 py-2 text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="disabled:opacity-50 text-white font-semibold px-6 py-2 rounded-lg text-sm transition-colors"
          style={{backgroundColor: loading ? '#8a9a5b' : '#5a6e2c'}}
        >
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </form>
    </div>
  )
}
