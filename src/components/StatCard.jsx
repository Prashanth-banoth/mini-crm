
function StatCard({ title, value, darkMode = false }) {
  return (
    <div className={`p-5 md:p-6 rounded-xl shadow-sm border transition-colors ${
      darkMode
        ? 'bg-slate-900 border-slate-700'
        : 'bg-white border-slate-200'
    }`}>
      <h3 className={`text-sm font-medium ${
        darkMode ? 'text-slate-400' : 'text-slate-500'
      }`}>
        {title}
      </h3>

      <p className={`text-3xl font-bold mt-3 ${
        darkMode ? 'text-white' : 'text-slate-900'
      }`}>
        {value}
      </p>
    </div>
  )
}

export default StatCard
