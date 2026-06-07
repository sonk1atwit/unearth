export default function Navbar({ onHome }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-stone-200/60 px-4 py-3 flex items-center justify-between">
      <span
        className="text-xl font-bold tracking-tight cursor-pointer hover:opacity-75 transition-opacity duration-200"
        style={{ color: '#5a6e2c' }}
        onClick={onHome}
      >
        Unearth
      </span>
      <div className="flex gap-4 text-sm text-stone-500">
        <a href="#" className="hover:text-stone-900 transition-colors duration-200">Dashboard</a>
        <a href="#" className="hover:text-stone-900 transition-colors duration-200">History</a>
        <a href="#" className="hover:text-stone-900 transition-colors duration-200">Account</a>
      </div>
    </nav>
  )
}
