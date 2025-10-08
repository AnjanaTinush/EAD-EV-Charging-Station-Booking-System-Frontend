export default function StationStats({ stations }) {
  const totalStations = stations.length;
  const activeStations = stations.filter(s => s.isActive).length;
  const inactiveStations = totalStations - activeStations;
  const acStations = stations.filter(s => s.type === 'AC').length;
  const dcStations = stations.filter(s => s.type === 'DC').length;
  const totalSlots = stations.reduce((sum, s) => sum + (s.availableSlots || 0), 0);

  const stats = [
    {
      name: 'Total Stations',
      value: totalStations,
      icon: '🏢',
      color: 'bg-blue-50 text-blue-600',
      bgColor: 'bg-blue-500'
    },
    {
      name: 'Active Stations',
      value: activeStations,
      icon: '✅',
      color: 'bg-green-50 text-green-600',
      bgColor: 'bg-green-500'
    },
    {
      name: 'Inactive Stations',
      value: inactiveStations,
      icon: '⏸️',
      color: 'bg-gray-50 text-gray-600',
      bgColor: 'bg-gray-500'
    },
    {
      name: 'Total Slots',
      value: totalSlots,
      icon: '🔌',
      color: 'bg-purple-50 text-purple-600',
      bgColor: 'bg-purple-500'
    }
  ];

  const typeStats = [
    {
      name: 'AC Charging',
      value: acStations,
      percentage: totalStations > 0 ? Math.round((acStations / totalStations) * 100) : 0,
      color: 'bg-blue-500'
    },
    {
      name: 'DC Charging',
      value: dcStations,
      percentage: totalStations > 0 ? Math.round((dcStations / totalStations) * 100) : 0,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="mb-6 space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Type Distribution */}
      {totalStations > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Station Type Distribution</h3>
          <div className="space-y-4">
            {typeStats.map((type) => (
              <div key={type.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                  <span className="text-sm font-medium text-gray-700">{type.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                    <div 
                      className={`h-2 rounded-full ${type.color}`}
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-16 text-right">
                    {type.value} ({type.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}