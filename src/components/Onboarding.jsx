import { useState, useEffect, useRef } from 'react'

function useInView(threshold = 0.15) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [threshold])

  return [ref, inView]
}

function Reveal({ children, delay = 0 }) {
  const [ref, inView] = useInView()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
    >
      {children}
    </div>
  )
}

export default function Onboarding({ onStart }) {
  return (
    <div className="dot-grid min-h-[calc(100vh-52px)]">
      <div className="max-w-2xl mx-auto py-10 sm:py-16 px-4">

        <Reveal>
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-3 tracking-tight">
            Welcome to <span style={{ color: '#5a6e2c' }}>Unearth</span>
          </h1>
          <p className="text-stone-500 text-base mb-10 leading-relaxed">
            Unearth is a free, open-source tool that shows you exactly which websites and data
            brokers have your personal information — and helps you take steps to remove it.
          </p>
        </Reveal>

        <div className="space-y-6 mb-10">
          <Reveal delay={0}>
            <Section step="1" title="You enter your name and email"
              body="That's all we need. We use it to check hundreds of online services for accounts and profiles registered under your username or email." />
          </Reveal>
          <Reveal delay={80}>
            <Section step="2" title="We scan public data sources"
              body="Unearth checks hundreds of online services across categories like social media, entertainment, gaming, and shopping to find where your username or email is registered." />
          </Reveal>
          <Reveal delay={160}>
            <Section step="3" title="You see your digital footprint"
              body="Results show which sites have your data and what kind of information is exposed, so you know exactly where you stand." />
          </Reveal>
          <Reveal delay={240}>
            <Section step="4" title="You decide what to do"
              body="For any exposure you want removed, Unearth provides a ready-to-send removal request you can send directly to that company." />
          </Reveal>
        </div>

        <Reveal delay={0}>
          <div className="bg-white/60 backdrop-blur-sm border border-stone-200 rounded-xl p-5 mb-10">
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
        </Reveal>

        <Reveal delay={0}>
          <button
            onClick={onStart}
            className="btn-shimmer text-white font-semibold px-8 py-3 rounded-lg text-sm hover:opacity-90 transition-opacity shadow-md w-full sm:w-auto"
          >
            Start Scanning
          </button>
        </Reveal>

      </div>
    </div>
  )
}

function Section({ step, title, body }) {
  return (
    <div className="flex gap-4">
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
