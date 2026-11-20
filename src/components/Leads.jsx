
import { memo, useState, useEffect } from 'react'
import {
  Pencil,
  Eye,
  Trash2,
  X,
  Search,
  Check,
  Download
} from 'lucide-react'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  status: 'New'
}

const API_URL = 'http://localhost:5000/api/leads'

const statusOptions = [
  'New',
  'Contacted',
  'Qualified',
  'Converted'
]

const LeadsTableHeader = memo(function LeadsTableHeader({ darkMode }) {
  return (
    <thead className={darkMode ? 'bg-slate-800' : 'bg-slate-50'}>
      <tr className={`h-14 border-b ${
        darkMode ? 'border-slate-700' : 'border-slate-200'
      }`}>
        {['Name', 'Email', 'Phone', 'Company', 'Status', 'Actions'].map((heading) => (
          <th
            key={heading}
            className={`px-4 text-xs font-semibold uppercase tracking-wider ${
              darkMode ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            {heading}
          </th>
        ))}
      </tr>
    </thead>
  )
})

function Leads({
  showAddLead,
  onCloseAddLead,
  leads,
  setLeads,
  loading = false,
  loadError = '',
  onRetryLoad,
  darkMode = false
}) {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  const [formData, setFormData] = useState(emptyForm)
  const [editingLead, setEditingLead] = useState(null)
  const [viewingLead, setViewingLead] = useState(null)
  const [deletingLead, setDeletingLead] = useState(null)

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  const leadsPerPage = 5

  // Theme styles
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900'
  const textSecondary = darkMode ? 'text-slate-300' : 'text-slate-600'
  const textMuted = darkMode ? 'text-slate-400' : 'text-slate-500'

  const inputStyle = `w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 ${
    darkMode
      ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400'
      : 'bg-white border-slate-300 text-slate-900'
  }`

  const editInputStyle = `w-full min-w-0 h-10 border rounded-md px-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 ${
    darkMode
      ? 'bg-slate-800 border-slate-600 text-white'
      : 'bg-white border-blue-300 text-slate-900'
  }`

  const modalStyle = `rounded-xl shadow-xl w-full p-6 max-h-[90vh] overflow-y-auto ${
    darkMode
      ? 'bg-slate-900 border border-slate-700'
      : 'bg-white'
  }`

  const secondaryButtonStyle = `px-5 py-2 border rounded-lg transition ${
    darkMode
      ? 'border-slate-600 text-slate-200 hover:bg-slate-800'
      : 'border-slate-300 text-slate-700 hover:bg-slate-100'
  }`

  // Search and Filter
  const filteredLeads = leads.filter((lead) => {
    const search = searchTerm.toLowerCase()

    const matchesSearch =
      (lead.name || '').toLowerCase().includes(search) ||
      (lead.email || '').toLowerCase().includes(search) ||
      (lead.phone || '').toLowerCase().includes(search) ||
      (lead.company || '').toLowerCase().includes(search)

    const matchesStatus =
      statusFilter === 'All' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / leadsPerPage)

  const safePage = Math.min(
    currentPage,
    Math.max(totalPages, 1)
  )

  const startIndex = (safePage - 1) * leadsPerPage

  const currentLeads = filteredLeads.slice(
    startIndex,
    startIndex + leadsPerPage
  )

  // Correct page when records are deleted or filtered
  useEffect(() => {
    const lastPage = Math.max(totalPages, 1)

    if (currentPage > lastPage) {
      setCurrentPage(lastPage)
    }
  }, [currentPage, totalPages])

  // Input handling
  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Close Add Modal
  const closeAddModal = () => {
    if (saving) return

    setFormData(emptyForm)
    setError('')
    onCloseAddLead()
  }

  // Reset edit form
  const resetForm = () => {
    setFormData(emptyForm)
    setEditingLead(null)
    setError('')
  }

  // ADD LEAD
  const handleAddLead = async (event) => {
    event.preventDefault()

    if (saving) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add lead')
      }

      setLeads((prev) => [data.lead, ...prev])

      setSearchTerm('')
      setStatusFilter('All')
      setCurrentPage(1)
      setFormData(emptyForm)
      onCloseAddLead()
    } catch (error) {
      console.error('Error adding lead:', error)
      setError(error.message || 'Unable to add lead')
    } finally {
      setSaving(false)
    }
  }

  // OPEN EDIT
  const handleEdit = (lead) => {
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      status: lead.status || 'New'
    })

    setError('')
    setEditingLead(lead)
  }

  // UPDATE LEAD
  const handleUpdateLead = async () => {
    if (saving) return

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.company.trim()
    ) {
      setError('Please fill all fields.')
      return
    }

    const leadId = editingLead?._id

    if (!leadId) {
      setError('MongoDB lead ID not found.')
      return
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          name: formData.name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          company: formData.company.trim()
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update lead')
      }

      setLeads((prev) =>
        prev.map((lead) =>
          lead._id === leadId ? data.lead : lead
        )
      )

      resetForm()
    } catch (error) {
      console.error('Error updating lead:', error)
      setError(error.message || 'Unable to update lead')
    } finally {
      setSaving(false)
    }
  }

  // DELETE LEAD
  const handleDeleteLead = async () => {
    if (deleting) return

    const leadId = deletingLead?._id

    if (!leadId) {
      alert('MongoDB lead ID not found')
      return
    }

    setDeleting(true)

    try {
      const response = await fetch(`${API_URL}/${leadId}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete lead')
      }

      setLeads((prev) =>
        prev.filter((lead) => lead._id !== leadId)
      )

      setDeletingLead(null)
    } catch (error) {
      console.error('Error deleting lead:', error)
      alert(error.message || 'Unable to delete lead')
    } finally {
      setDeleting(false)
    }
  }

  // EXPORT FILTERED LEADS TO CSV
  const handleExport = () => {
    if (filteredLeads.length === 0) {
      alert('No leads available to export')
      return
    }

    const headers = [
      'Name',
      'Email',
      'Phone',
      'Company',
      'Status'
    ]

    const escapeCSV = (value) => {
      const text = String(value ?? '')
      return `"${text.replace(/"/g, '""')}"`
    }

    const csvRows = filteredLeads.map((lead) => [
      lead.name,
      lead.email,
      lead.phone,
      lead.company,
      lead.status
    ])

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...csvRows.map((row) => row.map(escapeCSV).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;'
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'CRM_Leads.csv'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    URL.revokeObjectURL(url)
  }

  // Status colors
  const getStatusStyle = (status) => {
    const styles = {
      New: 'bg-blue-100 text-blue-700',
      Contacted: 'bg-yellow-100 text-yellow-700',
      Qualified: 'bg-purple-100 text-purple-700',
      Converted: 'bg-green-100 text-green-700'
    }

    return styles[status] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className={`rounded-xl border shadow-sm p-4 sm:p-6 mt-8 transition-colors ${
      darkMode
        ? 'bg-slate-900 border-slate-700 text-white'
        : 'bg-white border-slate-200 text-slate-900'
    }`}>

      {/* Heading and Actions */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">

        <div>
          <h2 className={`text-xl font-bold ${textPrimary}`}>
            Recent Leads
          </h2>

          <p className={`text-sm mt-1 ${textMuted}`}>
            Manage and track your leads
          </p>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value)
                setCurrentPage(1)
              }}
              className={`w-full sm:w-56 border rounded-lg pl-10 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
                darkMode
                  ? 'bg-slate-800 border-slate-600 text-white placeholder:text-slate-400'
                  : 'bg-white border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value)
              setCurrentPage(1)
            }}
            className={`border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode
                ? 'bg-slate-800 border-slate-600 text-white'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
          >
            <option value="All">All Status</option>

            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          {/* Export */}
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm hover:bg-green-700 transition"
          >
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`w-full overflow-x-auto rounded-lg border ${
        darkMode
          ? 'border-slate-700 bg-slate-900'
          : 'border-slate-200 bg-white'
      }`}>
        <table className="w-full min-w-[950px] table-fixed text-left">

          <colgroup>
            <col className="w-[170px]" />
            <col className="w-[210px]" />
            <col className="w-[140px]" />
            <col className="w-[170px]" />
            <col className="w-[130px]" />
            <col className="w-[130px]" />
          </colgroup>

          <LeadsTableHeader darkMode={darkMode} />

          <tbody className={`divide-y ${
            darkMode
              ? 'divide-slate-700 bg-slate-900'
              : 'divide-slate-100 bg-white'
          }`}>

            {loading ? (
              Array.from({ length: leadsPerPage }, (_, index) => (
                <tr key={`loading-${index}`} className="h-16">
                  <td colSpan="6" className="px-4">
                    <div className={`h-4 animate-pulse rounded ${
                      darkMode ? 'bg-slate-700' : 'bg-slate-100'
                    }`} />
                  </td>
                </tr>
              ))
            ) : loadError ? (
              <>
                <tr className="h-16">
                  <td colSpan="6" className="px-4 text-center">
                    <span className="text-sm text-red-600">
                      {loadError}
                    </span>

                    <button
                      type="button"
                      onClick={onRetryLoad}
                      className="ml-3 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      Try Again
                    </button>
                  </td>
                </tr>

                {Array.from({ length: leadsPerPage - 1 }, (_, index) => (
                  <tr key={`error-placeholder-${index}`} className="h-16">
                    <td colSpan="6" />
                  </tr>
                ))}
              </>
            ) : currentLeads.length > 0 ? (
              <>
                {currentLeads.map((lead) => {
                  const isEditing = editingLead?._id === lead._id

                  return (
                    <tr
                      key={lead._id}
                      className={`h-16 transition ${
                        darkMode
                          ? 'bg-slate-900 hover:bg-slate-800'
                          : 'bg-white hover:bg-slate-50'
                      }`}
                    >
                      {/* Name */}
                      <td className="overflow-hidden px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={editInputStyle}
                          />
                        ) : (
                          <span className={`block truncate font-medium ${textPrimary}`}>
                            {lead.name}
                          </span>
                        )}
                      </td>

                      {/* Email */}
                      <td className="overflow-hidden px-4">
                        {isEditing ? (
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={editInputStyle}
                          />
                        ) : (
                          <span className={`block truncate text-sm ${textSecondary}`}>
                            {lead.email}
                          </span>
                        )}
                      </td>

                      {/* Phone */}
                      <td className="overflow-hidden px-4">
                        {isEditing ? (
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className={editInputStyle}
                          />
                        ) : (
                          <span className={`block truncate text-sm ${textSecondary}`}>
                            {lead.phone || '-'}
                          </span>
                        )}
                      </td>

                      {/* Company */}
                      <td className="overflow-hidden px-4">
                        {isEditing ? (
                          <input
                            type="text"
                            name="company"
                            value={formData.company}
                            onChange={handleInputChange}
                            className={editInputStyle}
                          />
                        ) : (
                          <span className={`block truncate text-sm ${textSecondary}`}>
                            {lead.company || '-'}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="overflow-hidden px-4">
                        {isEditing ? (
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className={editInputStyle}
                          >
                            {statusOptions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className={`inline-block whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold ${getStatusStyle(lead.status)}`}>
                            {lead.status}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="overflow-hidden px-4">
                        <div className="flex items-center justify-center gap-1">

                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={handleUpdateLead}
                                disabled={saving}
                                title="Save Changes"
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-green-600 hover:bg-green-50 disabled:opacity-50"
                              >
                                <Check size={18} />
                              </button>

                              <button
                                type="button"
                                onClick={resetForm}
                                disabled={saving}
                                title="Cancel Editing"
                                className="w-9 h-9 flex items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-50"
                              >
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => setViewingLead(lead)}
                                title="View Lead"
                                className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                                  darkMode
                                    ? 'text-slate-400 hover:bg-blue-900/40 hover:text-blue-400'
                                    : 'text-slate-500 hover:bg-blue-50 hover:text-blue-600'
                                }`}
                              >
                                <Eye size={18} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEdit(lead)}
                                title="Edit Lead"
                                className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                                  darkMode
                                    ? 'text-slate-400 hover:bg-green-900/40 hover:text-green-400'
                                    : 'text-slate-500 hover:bg-green-50 hover:text-green-600'
                                }`}
                              >
                                <Pencil size={18} />
                              </button>

                              <button
                                type="button"
                                onClick={() => setDeletingLead(lead)}
                                title="Delete Lead"
                                className={`w-9 h-9 flex items-center justify-center rounded-lg ${
                                  darkMode
                                    ? 'text-slate-400 hover:bg-red-900/40 hover:text-red-400'
                                    : 'text-slate-500 hover:bg-red-50 hover:text-red-600'
                                }`}
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {Array.from(
                  { length: leadsPerPage - currentLeads.length },
                  (_, index) => (
                    <tr key={`page-placeholder-${index}`} className="h-16">
                      <td colSpan="6" />
                    </tr>
                  )
                )}
              </>
            ) : (
              <>
                <tr className="h-16">
                  <td colSpan="6" className={`text-center ${textMuted}`}>
                    {leads.length === 0
                      ? 'No leads available. Add your first lead!'
                      : 'No leads found. Try changing your search or filter.'}
                  </td>
                </tr>

                {Array.from({ length: leadsPerPage - 1 }, (_, index) => (
                  <tr key={`empty-placeholder-${index}`} className="h-16">
                    <td colSpan="6" />
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">

        <p className={`text-sm ${textMuted}`}>
          Showing {filteredLeads.length === 0 ? 0 : startIndex + 1} -{' '}
          {Math.min(startIndex + leadsPerPage, filteredLeads.length)} of{' '}
          {filteredLeads.length} leads
        </p>

        <div className="flex items-center gap-3">

          <button
            type="button"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safePage === 1}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
              darkMode
                ? 'border-slate-600 bg-slate-800 text-white hover:bg-slate-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Previous
          </button>

          <span className={`text-sm font-medium whitespace-nowrap ${
            darkMode ? 'text-white' : 'text-slate-700'
          }`}>
            Page {safePage} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage((page) =>
                Math.min(Math.max(totalPages, 1), page + 1)
              )
            }
            disabled={safePage >= totalPages || totalPages === 0}
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
              darkMode
                ? 'border-slate-600 bg-slate-800 text-white hover:bg-slate-700'
                : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            Next
          </button>
        </div>
      </div>

      {/* Add Lead Modal */}
      {showAddLead && (
        <div
          onClick={closeAddModal}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={modalStyle}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${textPrimary}`}>
                Add New Lead
              </h2>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={saving}
                className={textMuted}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleAddLead}>
              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter full name' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'Enter email address' },
                { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: 'Enter phone number' },
                { label: 'Company', name: 'company', type: 'text', placeholder: 'Enter company name' }
              ].map((field) => (
                <div className="mb-4" key={field.name}>
                  <label className={`block text-sm font-medium mb-2 ${
                    darkMode ? 'text-slate-300' : 'text-slate-700'
                  }`}>
                    {field.label}
                  </label>

                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    required
                    className={inputStyle}
                  />
                </div>
              ))}

              <div className="mb-6">
                <label className={`block text-sm font-medium mb-2 ${
                  darkMode ? 'text-slate-300' : 'text-slate-700'
                }`}>
                  Lead Status
                </label>

                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className={inputStyle}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-red-600 mb-4">
                  {error}
                </p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={saving}
                  className={secondaryButtonStyle}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Lead'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Lead Modal */}
      {viewingLead && (
        <div
          onClick={() => setViewingLead(null)}
          className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
        >
          <div
            onClick={(event) => event.stopPropagation()}
            className={`${modalStyle} max-w-md`}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-xl font-bold ${textPrimary}`}>
                Lead Details
              </h2>

              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className={textMuted}
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-4">
              {[
                ['Name', viewingLead.name],
                ['Email', viewingLead.email],
                ['Phone', viewingLead.phone || '-'],
                ['Company', viewingLead.company || '-'],
                ['Status', viewingLead.status]
              ].map(([label, value]) => (
                <div
                  key={label}
                  className={`border-b pb-3 ${
                    darkMode ? 'border-slate-700' : 'border-slate-100'
                  }`}
                >
                  <p className={`text-xs mb-1 ${textMuted}`}>
                    {label}
                  </p>

                  <p className={`font-medium ${textPrimary}`}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="button"
                onClick={() => setViewingLead(null)}
                className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingLead && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className={`${modalStyle} max-w-sm`}>
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 text-red-600 p-3 rounded-full">
                <Trash2 size={25} />
              </div>
            </div>

            <h2 className={`text-xl font-bold text-center ${textPrimary}`}>
              Delete Lead?
            </h2>

            <p className={`text-sm text-center mt-2 ${textMuted}`}>
              Are you sure you want to delete
              <span className={`font-semibold ${
                darkMode ? 'text-white' : 'text-slate-800'
              }`}>
                {' '}{deletingLead.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setDeletingLead(null)}
                disabled={deleting}
                className={secondaryButtonStyle}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeleteLead}
                disabled={deleting}
                className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Leads
