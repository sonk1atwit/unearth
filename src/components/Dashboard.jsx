export default function Dashboard({ results }) {
  const found = results.filter(r => r.status === 'found')
  const notFound = results.filter(r => r.status === 'not_found')

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Sources Scanned" value={results.length} />
        <StatCard label="Exposures Found" value={found.length} color="text-terracotta" style={{color: '#b85c38'}} />
        <StatCard label="Clear" value={notFound.length} style={{color: '#5a6e2c'}} />
      </div>

      <h2 className="text-lg font-semibold mb-4 text-stone-800">Scan Results</h2>
      <div className="flex flex-col gap-3">
        {results.map(r => (
          <ResultCard key={r.source} result={r} />
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, style }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-sm">
      <p className="text-xs text-stone-400 mb-1">{label}</p>
      <p className="text-2xl font-bold text-stone-800" style={style}>{value}</p>
    </div>
  )
}

function ResultCard({ result }) {
  const found = result.status === 'found'
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-stone-800">{result.source}</span>
          <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{result.type}</span>
        </div>
        <p className="text-xs text-stone-500">{result.detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${found ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
          {found ? 'Exposed' : 'Clear'}
        </span>
        {found && (
          <button className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1 rounded-full transition-colors">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
