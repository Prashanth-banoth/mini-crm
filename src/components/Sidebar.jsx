
import { Sun, Moon } from 'lucide-react'

function Sidebar({
  activePage,
  setActivePage,
  darkMode,
  setDarkMode
}) {
  const menuItems = ['Dashboard', 'Leads', 'Settings']

  return (
    <aside className="w-full md:w-64 md:min-h-screen bg-slate-900 text-white p-5 md:p-6 shrink-0">

      {/* Logo and Theme Toggle */}
      <div className="flex items-center justify-between mb-5 md:mb-10">
        <h2 className="text-2xl font-bold">
          Mini CRM
        </h2>

        <button
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-slate-200" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav>
        <ul className="flex flex-wrap md:flex-col gap-3 md:gap-4">
          {menuItems.map((item) => (
            <li key={item}>
              <button
                onClick={() => setActivePage(item)}
                className={`w-full text-left px-4 py-3 rounded-lg transition ${
                  activePage === item
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  )
}

export default Sidebar
