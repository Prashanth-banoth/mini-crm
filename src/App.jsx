
import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'

function App() {
  const [activePage, setActivePage] = useState('Dashboard')
  const [darkMode, setDarkMode] = useState(false)

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
        <Sidebar
          activePage={activePage}
          setActivePage={setActivePage}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <main className="flex-1 min-w-0">
          {activePage === 'Dashboard' && (
            <Dashboard darkMode={darkMode} />
          )}

          {activePage === 'Leads' && (
            <Dashboard showOnlyLeads darkMode={darkMode} />
          )}

          {activePage === 'Settings' && (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-8">
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                Settings
              </h1>

              <p className="text-slate-500 mt-2">
                Mini CRM application information.
              </p>

              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6 mt-8 max-w-2xl">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Application Information
                </h2>

                <div className="flex justify-between items-center mt-6">
                  <span className="text-slate-500">Application Name</span>
                  <span className="font-medium text-slate-900 dark:text-white">
                    Mini CRM
                  </span>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-700 mt-4 pt-4 flex justify-between items-center">
                  <span className="text-slate-500">Version</span>
                  <span className="font-semibold text-blue-600">1.0.0</span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default App
