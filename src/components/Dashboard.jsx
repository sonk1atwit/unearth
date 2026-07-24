import { useState, useEffect } from 'react'

const OPT_OUT_INFO = {
  'Spokeo':           { url: 'https://optout.spokeo.com', steps: 'Search for your name on the opt-out page, select your listing, and submit the removal form.' },
  'WhitePages':       { url: 'https://www.whitepages.com/suppression_requests', steps: 'Enter your information on the suppression request page and submit.' },
  'FastPeopleSearch': { url: 'https://www.fastpeoplesearch.com/removal', steps: 'Find your listing on the removal page and submit a request to have it taken down.' },
  'Radaris':          { url: 'https://radaris.com/control/privacy', steps: 'Go to the privacy control page, search for your profile, and request removal.' },
  'ZabaSearch':       { url: 'https://www.zabasearch.com/block_access/', steps: 'Fill out the opt-out form with your name and state to block your listing.' },
  'MyLife':           { url: 'https://www.mylife.com/privacy-policy/index.pubview', steps: 'Contact MyLife directly via their privacy page to request profile removal.' },
  'BeenVerified':     { url: 'https://www.beenverified.com/opt-out', steps: 'Enter your name and state, locate your record, and submit the opt-out request.' },
  'TruthFinder':      { url: 'https://www.truthfinder.com/opt-out', steps: 'Go to the opt-out page, search for your record, and submit a removal request.' },
  'Instant Checkmate':{ url: 'https://www.instantcheckmate.com/opt-out', steps: 'Visit the opt-out page, search for your listing, and submit a removal request.' },
  'LinkedIn':         { url: 'https://www.linkedin.com/psettings/privacy', steps: 'Go to Settings > Visibility and restrict who can see your profile and contact information.' },
  'Facebook':         { url: 'https://www.facebook.com/privacy', steps: 'Go to Settings > Privacy and limit who can search for you and see your information.' },
  'Twitter/X':        { url: 'https://twitter.com/settings/account', steps: 'Go to Settings > Privacy and Safety to restrict who can find and see your account.' },
  'Intelius':         { url: 'https://www.intelius.com/opt-out', steps: 'Search for your record on the opt-out page and submit a removal request.' },
  'PeopleFinder':     { url: 'https://www.peoplefinders.com/manage', steps: 'Search for your record and follow the steps to request removal.' },
}

// Direct account-deletion / settings pages for common account-based services.
// Keys are matched case-insensitively against the source name.
const DELETE_URLS = {
  'apple':       'https://support.apple.com/en-us/HT208109',
  'appletv':     'https://support.apple.com/en-us/HT208109',
  'icloud':      'https://support.apple.com/en-us/HT208109',
  'google':      'https://myaccount.google.com/deleteaccount',
  'youtube':     'https://myaccount.google.com/deleteaccount',
  'gmail':       'https://myaccount.google.com/deleteaccount',
  'facebook':    'https://www.facebook.com/help/delete_account',
  'instagram':   'https://www.instagram.com/accounts/remove/request/permanent/',
  'twitter':     'https://twitter.com/settings/deactivate',
  'x':           'https://twitter.com/settings/deactivate',
  'twitter/x':   'https://twitter.com/settings/deactivate',
  'reddit':      'https://www.reddit.com/settings/data-request',
  'linkedin':    'https://www.linkedin.com/psettings/account-management/close-submit',
  'snapchat':    'https://accounts.snapchat.com/accounts/delete_account',
  'tiktok':      'https://support.tiktok.com/en/account-and-privacy/deleting-an-account',
  'pinterest':   'https://www.pinterest.com/settings/account-settings/',
  'spotify':     'https://support.spotify.com/us/article/close-account/',
  'netflix':     'https://www.netflix.com/cancelplan',
  'amazon':      'https://www.amazon.com/privacy/data-deletion',
  'discord':     'https://support.discord.com/hc/en-us/articles/212500837',
  'steam':       'https://help.steampowered.com/en/wizard/HelpWithDataRelatedIssues',
  'twitch':      'https://www.twitch.tv/user/delete-account',
  'ebay':        'https://www.ebay.com/help/account/changing-account-settings/closing-account',
  'paypal':      'https://www.paypal.com/myaccount/settings/',
  'microsoft':   'https://account.live.com/closeaccount.aspx',
  'github':      'https://github.com/settings/admin',
  'dropbox':     'https://www.dropbox.com/account/delete',
  'yahoo':       'https://login.yahoo.com/account/delete-user',
}

// Resolve the best "remove my account" link for a source.
// Priority: known opt-out page > curated delete page > the site's own domain.
function resolveRemovalLink(source, listingUrl) {
  const optOutUrl = OPT_OUT_INFO[source]?.url
  if (optOutUrl) return { url: optOutUrl, kind: 'optout' }

  const deleteUrl = DELETE_URLS[source?.toLowerCase().trim()]
  if (deleteUrl) return { url: deleteUrl, kind: 'delete' }

  if (listingUrl) {
    try {
      return { url: new URL(listingUrl).origin, kind: 'site' }
    } catch {
      // listingUrl wasn't a valid absolute URL — fall through
    }
  }
  return { url: null, kind: 'none' }
}

function toCsvValue(value) {
  const str = String(value ?? '')
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function exportResultsToCsv(results) {
  const headers = ['Source', 'Type', 'Status', 'URL', 'Detail']
  const rows = results.map(r => [
    r.source,
    r.type,
    r.status === 'found' ? 'Exposed' : 'Clear',
    r.url || '',
    r.detail,
  ])
  const csv = [headers, ...rows]
    .map(row => row.map(toCsvValue).join(','))
    .join('\n')

  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  link.href = url
  link.download = `unearth-report-${date}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

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

function ScanBanner() {
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 2200)
    const removeTimer = setTimeout(() => setVisible(false), 3000)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [])

  if (!visible) return null
  return (
    <div
      className={`mb-6 flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium ${fading ? 'animate-fade-out-up' : 'animate-fade-slide-up'}`}
      style={{ backgroundColor: 'rgba(90,110,44,0.08)', borderColor: 'rgba(90,110,44,0.25)', color: '#5a6e2c' }}
    >
      <span>✓</span>
      <span>Scan complete — your digital footprint has been mapped.</span>
    </div>
  )
}

function DonutChart({ found, total }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 150)
    return () => clearTimeout(t)
  }, [])

  const radius = 58
  const circumference = 2 * Math.PI * radius
  const foundLen = animated ? circumference * (found / total) : 0
  const clearLen = animated ? circumference * ((total - found) / total) : 0

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox="0 0 160 160" className="w-36 h-36">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#e7e5e4" strokeWidth="16" />
        <circle
          cx="80" cy="80" r={radius} fill="none"
          stroke="#4ade80" strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${clearLen} ${circumference}`}
          strokeDashoffset={-foundLen}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dasharray 0.9s ease, stroke-dashoffset 0.9s ease' }}
        />
        <circle
          cx="80" cy="80" r={radius} fill="none"
          stroke="#fb923c" strokeWidth="16" strokeLinecap="round"
          strokeDasharray={`${foundLen} ${circumference}`}
          transform="rotate(-90 80 80)"
          style={{ transition: 'stroke-dasharray 0.9s ease' }}
        />
        <text x="80" y="72" textAnchor="middle" fill="#1c1917" fontSize="30" fontWeight="bold">{found}</text>
        <text x="80" y="93" textAnchor="middle" fill="#78716c" fontSize="11">of {total} exposed</text>
      </svg>
      <div className="flex gap-3 text-xs text-stone-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor:'#fb923c'}} />Exposed</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full inline-block" style={{backgroundColor:'#4ade80'}} />Clear</span>
      </div>
    </div>
  )
}

function CategoryBreakdown({ results }) {
  const [animated, setAnimated] = useState(false)
  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 400)
    return () => clearTimeout(t)
  }, [])

  const groups = {}
  results.forEach(r => {
    if (!groups[r.type]) groups[r.type] = { found: 0, total: 0 }
    groups[r.type].total++
    if (r.status === 'found') groups[r.type].found++
  })

  return (
    <div className="flex-1 space-y-3 w-full">
      {Object.entries(groups).map(([type, counts]) => {
        const pct = Math.round((counts.found / counts.total) * 100)
        return (
          <div key={type}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-stone-600 font-medium">{type}</span>
              <span className="text-stone-400">{counts.found}/{counts.total} exposed</span>
            </div>
            <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: animated ? `${pct}%` : '0%',
                  backgroundColor: counts.found > 0 ? '#fb923c' : '#4ade80',
                  transition: 'width 0.8s ease'
                }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RemovalModal({ source, onClose }) {
  const [copied, setCopied] = useState(false)
  const info = OPT_OUT_INFO[source] || { url: null, steps: 'Visit the company\'s website and look for a Privacy or Opt-Out page.' }

  const isSocialMedia = ['LinkedIn', 'Facebook'].includes(source)

  const template = `Subject: Personal Data Removal Request

To Whom It May Concern at ${source},

I am writing to formally request the removal of my personal information from your database and any public-facing records or directories.

I have the right to request deletion of my personal data. Please remove all records associated with my name from your systems and confirm once this has been completed.

Thank you,
[Your Name]`

  function handleCopy() {
    navigator.clipboard.writeText(template)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-fade-slide-up" onClick={e => e.stopPropagation()}>

        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-stone-400 uppercase tracking-widest font-medium mb-0.5">Removal Request</p>
            <h3 className="text-lg font-bold text-stone-800">{source}</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 transition-colors text-xl leading-none">×</button>
        </div>

        <div className="mb-4 bg-stone-50 rounded-xl p-4 border border-stone-100">
          <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Steps</p>
          <p className="text-sm text-stone-600 leading-relaxed">{info.steps}</p>
          {info.url && (
            <a
              href={info.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg text-white hover:opacity-85 transition-opacity"
              style={{ backgroundColor: '#5a6e2c' }}
            >
              Go to opt-out page →
            </a>
          )}
        </div>

        {!isSocialMedia && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-widest mb-2">Email Template</p>
            <textarea
              readOnly
              value={template}
              className="w-full text-xs text-stone-600 bg-stone-50 border border-stone-200 rounded-xl p-3 h-40 resize-none focus:outline-none font-mono"
            />
            <button
              onClick={handleCopy}
              className="mt-2 text-xs font-medium px-4 py-2 rounded-lg border transition-all duration-200"
              style={copied
                ? { backgroundColor: 'rgba(90,110,44,0.08)', borderColor: 'rgba(90,110,44,0.3)', color: '#5a6e2c' }
                : { backgroundColor: '#f5f4f2', borderColor: '#e7e5e4', color: '#57534e' }
              }
            >
              {copied ? '✓ Copied' : 'Copy email'}
            </button>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full text-sm text-stone-500 hover:text-stone-700 transition-colors pt-2"
        >
          Close
        </button>
      </div>
    </div>
  )
}

export default function Dashboard({ results, onNewScan }) {
  const found = results.filter(r => r.status === 'found')
  const notFound = results.filter(r => r.status === 'not_found')
  const [removalSource, setRemovalSource] = useState(null)
  const [statusFilter, setStatusFilter] = useState('All')
  // Multi-select category filter. Empty set means "All Types".
  const [typeFilters, setTypeFilters] = useState(() => new Set())

  const types = [...new Set(results.map(r => r.type))]

  function toggleType(type) {
    setTypeFilters(prev => {
      const next = new Set(prev)
      if (next.has(type)) next.delete(type)
      else next.add(type)
      return next
    })
  }

  const filtered = results
    .filter(r => statusFilter === 'All' || (statusFilter === 'Exposed' ? r.status === 'found' : r.status === 'not_found'))
    .filter(r => typeFilters.size === 0 || typeFilters.has(r.type))

  return (
    <div>
      <ScanBanner />

      <div className="animate-fade-slide-up mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2" style={{ animationDelay: '50ms' }}>
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-widest mb-1 font-medium">Dig Report</p>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-800">
            {found.length} of {results.length} sources{' '}
            <span style={{ color: '#b85c38' }}>have your data</span>
          </h2>
          <p className="text-sm text-stone-500 mt-1">
            {notFound.length} source{notFound.length !== 1 ? 's' : ''} returned no results.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => exportResultsToCsv(results)}
            disabled={results.length === 0}
            className="text-xs font-medium px-4 py-2 rounded-lg border border-stone-300 text-stone-500 hover:bg-stone-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Export CSV
          </button>
          {onNewScan && (
            <button
              onClick={onNewScan}
              className="text-xs font-medium px-4 py-2 rounded-lg border border-stone-300 text-stone-500 hover:bg-stone-50 transition-colors"
            >
              New Scan
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard label="Sources Scanned" value={results.length} delay={100} />
        <StatCard label="Exposures Found" value={found.length} delay={180} valueStyle={{ color: '#b85c38' }} />
        <StatCard label="Clear" value={notFound.length} delay={260} valueStyle={{ color: '#5a6e2c' }} />
      </div>

      <div className="animate-fade-slide-up bg-white/70 backdrop-blur-sm border border-stone-200 rounded-xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-6" style={{ animationDelay: '300ms' }}>
        <DonutChart found={found.length} total={results.length} />
        <CategoryBreakdown results={results} />
      </div>

      <div className="animate-fade-slide-up mb-4 flex flex-wrap gap-2" style={{ animationDelay: '360ms' }}>
        {['All', 'Exposed', 'Clear'].map(f => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150"
            style={statusFilter === f
              ? { backgroundColor: '#5a6e2c', color: 'white' }
              : { backgroundColor: '#f5f4f2', color: '#78716c' }}
          >
            {f}
          </button>
        ))}
        <span className="w-px bg-stone-200 mx-1" />
        <button
          onClick={() => setTypeFilters(new Set())}
          className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150"
          style={typeFilters.size === 0
            ? { backgroundColor: '#b85c38', color: 'white' }
            : { backgroundColor: '#f5f4f2', color: '#78716c' }}
        >
          All Types
        </button>
        {types.map(f => (
          <button
            key={f}
            onClick={() => toggleType(f)}
            className="text-xs px-3 py-1.5 rounded-full font-medium transition-all duration-150"
            style={typeFilters.has(f)
              ? { backgroundColor: '#b85c38', color: 'white' }
              : { backgroundColor: '#f5f4f2', color: '#78716c' }}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-8">No results match the selected filters.</p>
        ) : (
          filtered.map((r, i) => (
            <div key={r.source} className="animate-fade-slide-up" style={{ animationDelay: `${400 + i * 50}ms` }}>
              <ResultCard result={r} onRemove={setRemovalSource} />
            </div>
          ))
        )}
      </div>

      {removalSource && (
        <RemovalModal source={removalSource} onClose={() => setRemovalSource(null)} />
      )}
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
      <p className="text-xs text-stone-400 mb-1 h-8 flex items-start">{label}</p>
      <p className="text-2xl font-bold text-stone-800" style={valueStyle}>{displayed}</p>
    </div>
  )
}

function ResultCard({ result, onRemove }) {
  const found = result.status === 'found'
  const removal = resolveRemovalLink(result.source, result.url)
  const removalTitle = {
    optout: `Go to ${result.source}'s opt-out page`,
    delete: `Delete your account on ${result.source}`,
    site: `Go to ${result.source} to manage or delete your account`,
    none: 'Exposed',
  }[removal.kind]
  return (
    <div
      className="bg-white/70 backdrop-blur-sm rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 border border-stone-200 border-l-4"
      style={{ borderLeftColor: found ? '#fb923c' : '#4ade80' }}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {found && result.url ? (
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-sm text-stone-800 hover:underline inline-flex items-center gap-1 transition-colors"
              style={{ color: '#b85c38' }}
            >
              {result.source}
              <span aria-hidden="true" className="text-[10px] opacity-70">↗</span>
            </a>
          ) : (
            <span className="font-semibold text-sm text-stone-800">{result.source}</span>
          )}
          <span className="text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full">{result.type}</span>
        </div>
        <p className="text-xs text-stone-500 break-all">{result.detail}</p>
      </div>
      <div className="flex items-center gap-2">
        {found && removal.url ? (
          <a
            href={removal.url}
            target="_blank"
            rel="noopener noreferrer"
            title={removalTitle}
            className="text-xs font-medium px-2 py-1 rounded-full bg-orange-100 text-orange-700 animate-pulse-glow hover:bg-orange-200 inline-flex items-center gap-1 transition-colors"
          >
            Exposed
            <span aria-hidden="true" className="text-[10px] opacity-70">↗</span>
          </a>
        ) : (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${found ? 'bg-orange-100 text-orange-700 animate-pulse-glow' : 'bg-green-100 text-green-700'}`}>
            {found ? 'Exposed' : 'Clear'}
          </span>
        )}
        {found && (
          <button
            onClick={() => onRemove(result.source)}
            className="text-xs font-medium px-3 py-1 rounded-full text-white hover:opacity-80 transition-opacity duration-150"
            style={{ backgroundColor: '#b85c38' }}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  )
}
