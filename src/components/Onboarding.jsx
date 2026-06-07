export default function Onboarding({ onStart }) {
  return (
    <div className="dot-grid min-h-[calc(100vh-52px)]">
      <div className="max-w-2xl mx-auto py-16 px-4">
        <div className="animate-fade-slide-up" style={{ animationDelay: '0ms' }}>
          <h1 className="text-4xl font-bold text-stone-800 mb-3 tracking-tight">
            Welcome to <span style={{ color: '#5a6e2c' }}>Unearth</span>
          </h1>
          <p className="text-stone-500 text-base mb-10 leading-relaxed">
            Unearth is a free, open-source tool that shows you exactly which websites and data
            brokers have your personal information — and helps you take steps to remove it.
          </p>
        </div>

        <div className="space-y-6 mb-10">
          <Section step="1" title="You enter your name and email" delay={100}
            body="That's all we need. We use this to search publicly available records across people-search sites, data brokers, and social platforms." />
          <Section step="2" title="We scan public data sources" delay={200}
            body="Unearth checks services like Spokeo, WhitePages, BeenVerified, Intelius, and others — the same sites that sell your information without you ever signing up." />
          <Section step="3" title="You see your digital footprint" delay={300}
            body="Results show which sites have your data and what kind of information is exposed, so you know exactly where you stand." />
          <Section step="4" title="You decide what to do" delay={400}
            body="For any exposure you want removed, Unearth provides a ready-to-send removal request you can send directly to that company." />
        </div>

        <div className="animate-fade-slide-up bg-white/60 backdrop-blur-sm border border-stone-200 rounded-xl p-5 mb-10" style={{ animationDelay: '500ms' }}>
          <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
            Transparency Notice
          </p>
          <ul className="text-sm text-stone-600 space-y-1.5 list-disc list-inside">
            <li>Your name and email are only used to perform the scan — they are never stored or shared.</li>
            <li>All queries go through our backend server so your searches stay private from third parties.</li>
            <li>This tool only reads publicly available information. We do not access private accounts.</li>
            <li>Unearth is open-source. You can inspect the full codebase on GitHub.</li>
          </ul>
        </div>

        <div className="animate-fade-slide-up" style={{ animationDelay: '600ms' }}>
          <button
            onClick={onStart}
            className="btn-shimmer text-white font-semibold px-8 py-3 rounded-lg text-sm hover:opacity-90 transition-opacity shadow-md"
          >
            Start Scanning
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({ step, title, body, delay }) {
  return (
    <div className="animate-fade-slide-up flex gap-4" style={{ animationDelay: `${delay}ms` }}>
      <div
        className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5 shadow-sm"
        style={{ backgroundColor: '#5a6e2c' }}
      >
        {step}
      </div>
      <div>
        <p className="font-semibold text-stone-800 text-sm mb-1">{title}</p>
        <p className="text-stone-500 text-sm leading-relaxed">{body}</p>
      </div>
    </div>
  )
}
