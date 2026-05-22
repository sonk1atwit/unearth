export default function Navbar() {
  return (
    <nav className="bg-stone-100 border-b border-stone-300 px-4 py-3 flex items-center justify-between">
      <span className="text-xl font-bold tracking-tight text-olive-700" style={{color: '#5a6e2c'}}>Unearth</span>
      <div className="flex gap-4 text-sm text-stone-500">
        <a href="#" className="hover:text-stone-900 transition-colors">Dashboard</a>
        <a href="#" className="hover:text-stone-900 transition-colors">History</a>
        <a href="#" className="hover:text-stone-900 transition-colors">Account</a>
      </div>
    </nav>
  )
}
