import { useState, useEffect } from 'react'

function useCountUp(target) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (target === 0) { setVal(0); return }
    let current = 0
    const step = Math.ceil(target / 20)
    const timer = setInterval(() => {
      current = Math.min(current + step, target)
      setVal(current)
      if (current >= target) clearInterval(timer)
    }, 40)
    return () => clearInterval(timer)
  }, [target])
  return val
}

export default function Dashboard({ results }) {
  const found = results.filter(r => r.status === 'found')
  const notFound = results.filter(r => r.status === 'not_found')

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Sources Scanned" value={results.length} delay={0} />
        <StatCard label="Exposures Found" value={found.length} delay={80} valueStyle={{ color: '#b85c38' }} />
        <StatCard label="Clear" value={notFound.length} delay={160} valueStyle={{ color: '#5a6e2c' }} />
      </div>

      <h2 className="animate-fade-slide-up text-lg font-semibold mb-4 text-stone-800" style={{ animationDelay: '240ms' }}>
        Scan Results
      </h2>
      <div className="flex flex-col gap-3">
        {results.map((r, i) => (
          <div key={r.source} className="animate-fade-slide-up" style={{ animationDelay: `${300 + i * 60}ms` }}>
            <ResultCard result={r} />
          </div>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, delay, valueStyle }) {
  const displayed = useCountUp(value)
  return (
    <div
      className="animate-fade-slide-up bg-white/70 backdrop-blur-sm border border-stone-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
      style={{ animationDelay: `${delay}ms` }}
    >
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-stone-800" style={valueStyle}>{displayed}</p>
    </div>
  )
}

function ResultCard({ result }) {
  const found = result.status === 'found'
  return (
    <div
      className="bg-white/70 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-stone-200 border-l-4"
      style={{ borderLeftColor: found ? '#fb923c' : '#4ade80' }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-stone-800">{result.source}</span>
          <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{result.type}</span>
        </div>
        <p className="text-xs text-stone-500">{result.detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${found ? 'bg-orange-100 text-orange-700 animate-pulse-glow' : 'bg-green-100 text-green-700'}`}>
          {found ? 'Exposed' : 'Clear'}
        </span>
        {found && (
          <button className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1 rounded-full transition-colors duration-150">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
