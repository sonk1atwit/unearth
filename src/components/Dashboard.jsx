export default function Dashboard({ results }) {
  const found = results.filter(r => r.status === 'found')
  const notFound = results.filter(r => r.status === 'not_found')

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Sources Scanned" value={results.length} />
        <StatCard label="Exposures Found" value={found.length} color="text-red-400" />
        <StatCard label="Clear" value={notFound.length} color="text-emerald-400" />
      </div>

      <h2 className="text-lg font-semibold mb-4">Scan Results</h2>
      <div className="flex flex-col gap-3">
        {results.map(r => (
          <ResultCard key={r.source} result={r} />
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value, color = 'text-white' }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function ResultCard({ result }) {
  const found = result.status === 'found'
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{result.source}</span>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">{result.type}</span>
        </div>
        <p className="text-xs text-gray-400">{result.detail}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${found ? 'bg-red-900 text-red-300' : 'bg-emerald-900 text-emerald-300'}`}>
          {found ? 'Exposed' : 'Clear'}
        </span>
        {found && (
          <button className="text-xs bg-gray-800 hover:bg-gray-700 text-white px-3 py-1 rounded-full transition-colors">
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
