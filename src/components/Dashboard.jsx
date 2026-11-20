
import { memo, useState, useEffect, useCallback } from 'react'
import StatCard from './StatCard'
import Leads from './Leads'

const DashboardTableHeader = memo(function DashboardTableHeader({ darkMode }) {
  return (
    <thead className={darkMode ? 'bg-slate-800' : 'bg-slate-50'}>
      <tr>
        {['Name', 'Email', 'Company', 'Status'].map((heading) => (
          <th
            key={heading}
            className={`px-6 py-4 text-sm font-semibold ${
              darkMode ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
  )
})

function Dashboard({ showOnlyLeads = false, darkMode = false }) {
  const [showAddLead, setShowAddLead] = useState(false)
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const pageSize = 5

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('http://localhost:5000/api/leads')

      if (!response.ok) {
        throw new Error('Failed to fetch leads')
      }

      const data = await response.json()
      setLeads(data)
    } catch (error) {
      console.error(error)
      setError('Unable to load leads. Please check your backend server.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const leadCounts = leads.reduce(
    (counts, lead) => {
      counts.total++
      if (lead.status === 'New') counts.new++
      if (lead.status === 'Contacted') counts.contacted++
      if (lead.status === 'Qualified') counts.qualified++
      if (lead.status === 'Converted') counts.converted++
      return counts
    },
    {
      total: 0,
      new: 0,
      contacted: 0,
      qualified: 0,
      converted: 0
    }
  )

  const totalPages = Math.ceil(leads.length / pageSize)

  const safePage = Math.min(currentPage, Math.max(totalPages, 1))
  const startIndex = (safePage - 1) * pageSize

  const currentLeads = leads.slice(startIndex, startIndex + pageSize)

  useEffect(() => {
    if (currentPage > Math.max(totalPages, 1)) {
      setCurrentPage(Math.max(totalPages, 1))
    }
  }, [currentPage, totalPages])

  const pageBg = darkMode
    ? 'bg-slate-950 text-white'
    : 'bg-slate-50 text-slate-900'

  const cardBg = darkMode
    ? 'bg-slate-900 border-slate-700'
    : 'bg-white border-slate-200'

  const headingColor = darkMode ? 'text-white' : 'text-slate-900'
  const mutedColor = darkMode ? 'text-slate-400' : 'text-slate-500'
  const borderColor = darkMode ? 'border-slate-700' : 'border-slate-200'

  return (
    <div className={`w-full min-h-screen p-4 sm:p-6 lg:p-8 ${pageBg}`}>

      {!showOnlyLeads ? (
        <>
          {/* Dashboard Heading */}
          <div>
            <h1 className={`text-3xl font-bold ${headingColor}`}>
              Dashboard
            </h1>
            <p className={`${mutedColor} mt-2`}>
              Welcome to your CRM dashboard.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-8">
            <StatCard title="Total Leads" value={leadCounts.total} darkMode={darkMode} />
            <StatCard title="New Leads" value={leadCounts.new} darkMode={darkMode} />
            <StatCard title="Contacted" value={leadCounts.contacted} darkMode={darkMode} />
            <StatCard title="Qualified" value={leadCounts.qualified} darkMode={darkMode} />
            <StatCard title="Converted" value={leadCounts.converted} darkMode={darkMode} />
          </div>

          {/* Recent Leads Table */}
          <div className={`${cardBg} rounded-xl border shadow-sm mt-8`}>
            <div className={`p-5 border-b ${borderColor}`}>
              <h2 className={`text-xl font-semibold ${headingColor}`}>
                Recent Leads
              </h2>
              <p className={`${mutedColor} text-sm mt-1`}>
                Overview of your latest leads.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] table-fixed text-left">
                <colgroup>
                  <col className="w-[160px]" />
                  <col className="w-[220px]" />
                  <col className="w-[160px]" />
                  <col className="w-[110px]" />
                </colgroup>

                <DashboardTableHeader darkMode={darkMode} />

                <tbody className={`divide-y ${borderColor}`}>
                  {loading ? (
                    Array.from({ length: pageSize }, (_, index) => (
                      <tr key={`loading-${index}`} className="h-16">
                        <td colSpan="4" className="px-6">
                          <div className={`h-4 animate-pulse rounded ${
                            darkMode ? 'bg-slate-700' : 'bg-slate-100'
                          }`} />
                        </td>
                      </tr>
                    ))
                  ) : error ? (
                    <>
                      <tr className="h-16">
                        <td colSpan="4" className="px-6 text-center">
                          <span className="text-sm text-red-500">{error}</span>
                          <button
                            onClick={fetchLeads}
                            className="ml-3 text-sm font-medium text-blue-500 hover:text-blue-400"
                          >
                            Try Again
                          </button>
                        </td>
                      </tr>
                      {Array.from({ length: pageSize - 1 }, (_, index) => (
                        <tr key={`error-${index}`} className="h-16">
                          <td colSpan="4" />
                        </tr>
                      ))}
                    </>
                  ) : leads.length === 0 ? (
                    <>
                      <tr className="h-16">
                        <td colSpan="4" className={`px-6 text-center text-sm ${mutedColor}`}>
                          No leads available. Add your first lead.
                        </td>
                      </tr>
                      {Array.from({ length: pageSize - 1 }, (_, index) => (
                        <tr key={`empty-${index}`} className="h-16">
                          <td colSpan="4" />
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      {currentLeads.map((lead) => (
                        <tr
                          key={lead._id || lead.id}
                          className={`h-16 transition ${
                            darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                          }`}
                        >
                          <td className={`overflow-hidden px-6 py-4 text-sm font-medium ${headingColor}`}>
                            <span className="block truncate">{lead.name}</span>
                          </td>
                          <td className={`overflow-hidden px-6 py-4 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="block truncate">{lead.email}</span>
                          </td>
                          <td className={`overflow-hidden px-6 py-4 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                            <span className="block truncate">{lead.company}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                              lead.status === 'New'
                                ? 'bg-blue-100 text-blue-700'
                                : lead.status === 'Contacted'
                                ? 'bg-yellow-100 text-yellow-700'
                                : lead.status === 'Qualified'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {lead.status}
                            </span>
                          </td>
                        </tr>
                      ))}

                      {Array.from(
                        { length: pageSize - currentLeads.length },
                        (_, index) => (
                          <tr key={`placeholder-${index}`} className="h-16">
                            <td colSpan="4" />
                          </tr>
                        )
                      )}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className={`flex flex-col sm:flex-row justify-between items-center gap-4 p-5 border-t ${borderColor}`}>
              <p className={`text-sm ${mutedColor}`}>
                Showing {leads.length === 0 ? 0 : startIndex + 1} to{' '}
                {Math.min(startIndex + pageSize, leads.length)} of{' '}
                {leads.length} leads
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                  disabled={safePage === 1}
                  className={`px-4 py-2 border rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed ${
                    darkMode
                      ? 'border-slate-600 hover:bg-slate-800'
                      : 'hover:bg-slate-100'
                  }`}
                >
                  Previous
                </button>

                <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                  Page {safePage} of {Math.max(totalPages, 1)}
                </span>

                <button
                  type="button"
                  onClick={() => setCurrentPage((page) => Math.min(Math.max(totalPages, 1), page + 1))}
                  disabled={safePage >= totalPages || totalPages === 0}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Leads Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-3xl font-bold ${headingColor}`}>
                Leads Management
              </h1>
              <p className={`${mutedColor} mt-2`}>
                Manage all your leads in one place.
              </p>
            </div>

            <button
              onClick={() => setShowAddLead(true)}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              + Add Lead
            </button>
          </div>

          <Leads
            leads={leads}
            setLeads={setLeads}
            showAddLead={showAddLead}
            onCloseAddLead={() => setShowAddLead(false)}
            loading={loading}
            loadError={error}
            onRetryLoad={fetchLeads}
            darkMode={darkMode}
          />
        </>
      )}
    </div>
  )
}

export default Dashboard
