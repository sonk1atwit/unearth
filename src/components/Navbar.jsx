export default function Navbar() {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between">
      <span className="text-xl font-bold tracking-tight text-emerald-400">Unearth</span>
      <div className="flex gap-4 text-sm text-gray-400">
        <a href="#" className="hover:text-white transition-colors">Dashboard</a>
        <a href="#" className="hover:text-white transition-colors">History</a>
        <a href="#" className="hover:text-white transition-colors">Account</a>
      </div>
    </nav>
  )
}
