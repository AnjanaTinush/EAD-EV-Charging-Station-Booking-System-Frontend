import { useState, useEffect } from 'react';

export default function LoginHistory() {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadLoginHistory();
    // Add current session if user is logged in and no history exists
    addCurrentSessionIfNeeded();
  }, []);

  const addCurrentSessionIfNeeded = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const existingHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');

    // If user is logged in but no login history exists, add current session
    if (user.username && existingHistory.length === 0) {
      const currentLogin = {
        id: Date.now().toString(),
        loginTime: new Date().toISOString(),
        ipAddress: generateRandomIP(),
        device: detectDevice(),
        location: getRandomLocation(),
        status: 'Success',
        username: user.username
      };

      const updatedHistory = [currentLogin];
      localStorage.setItem('loginHistory', JSON.stringify(updatedHistory));
      setLoginHistory(updatedHistory);
      processChartData(updatedHistory);
    }
  };

  const generateRandomIP = () => {
    return `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  };

  const detectDevice = () => {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    return 'Unknown Device';
  };

  const getRandomLocation = () => {
    const locations = ['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Berlin', 'Toronto', 'Mumbai'];
    return locations[Math.floor(Math.random() * locations.length)];
  };

  const loadLoginHistory = () => {
    setLoading(true);

    // Get existing login history from localStorage (actual data only)
    const storedHistory = localStorage.getItem('loginHistory');
    const history = storedHistory ? JSON.parse(storedHistory) : [];

    setLoginHistory(history);
    processChartData(history);
    setLoading(false);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Process data for line chart
  const processChartData = (history) => {
    const loginsByDate = {};
    const last7Days = [];
    const today = new Date();

    // Generate last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString();
      last7Days.push(dateStr);
      loginsByDate[dateStr] = 0;
    }

    // Count logins by date
    history.forEach(login => {
      const loginDate = new Date(login.loginTime).toLocaleDateString();
      if (loginsByDate.hasOwnProperty(loginDate)) {
        loginsByDate[loginDate]++;
      }
    });

    // Create chart data array
    const chartData = last7Days.map((date, index) => ({
      date,
      shortDate: new Date(today.getTime() - (6 - index) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      logins: loginsByDate[date],
      index
    }));

    setChartData(chartData);
  };

  // Get latest 5 login entries
  const latestLogins = loginHistory.slice(0, 5);

  // Test function to add sample login entries (for demonstration)
  const addTestLogin = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const testLogin = {
      id: Date.now().toString(),
      loginTime: new Date().toISOString(),
      ipAddress: generateRandomIP(),
      device: detectDevice(),
      location: getRandomLocation(),
      status: Math.random() > 0.8 ? 'Failed' : 'Success',
      username: user.username || 'TestUser'
    };

    const existingHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
    const updatedHistory = [testLogin, ...existingHistory];
    localStorage.setItem('loginHistory', JSON.stringify(updatedHistory));
    setLoginHistory(updatedHistory);
    processChartData(updatedHistory);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading login history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Recent Login History</h2>
        <div className="flex space-x-2">
          <button
            onClick={addTestLogin}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add Test Login
          </button>
          <button
            onClick={loadLoginHistory}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Login Summary Line Chart */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Login Activity (Last 7 Days)</h3>
          <p className="mt-1 text-sm text-gray-500">
            Daily login summary showing user activity trends
          </p>
        </div>

        <div className="p-6">
          {chartData.length > 0 ? (
            <div className="h-64 relative">
              {/* Chart SVG */}
              <svg className="w-full h-full" viewBox="0 0 800 200">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="100" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 100 0 L 0 0 0 40" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Chart area */}
                <g transform="translate(60, 20)">
                  {/* Y-axis */}
                  <line x1="0" y1="0" x2="0" y2="160" stroke="#d1d5db" strokeWidth="2"/>

                  {/* X-axis */}
                  <line x1="0" y1="160" x2="680" y2="160" stroke="#d1d5db" strokeWidth="2"/>

                  {/* Data points and line */}
                  {chartData.length > 1 && (
                    <>
                      {/* Line path */}
                      <path
                        d={`M ${chartData.map((point, index) => {
                          const x = (index * 680) / (chartData.length - 1);
                          const maxLogins = Math.max(...chartData.map(d => d.logins), 1);
                          const y = 160 - (point.logins / maxLogins) * 140;
                          return `${x},${y}`;
                        }).join(' L ')}`}
                        fill="none"
                        stroke="#4f46e5"
                        strokeWidth="3"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                      />

                      {/* Data points */}
                      {chartData.map((point, index) => {
                        const x = (index * 680) / (chartData.length - 1);
                        const maxLogins = Math.max(...chartData.map(d => d.logins), 1);
                        const y = 160 - (point.logins / maxLogins) * 140;

                        return (
                          <g key={index}>
                            {/* Point circle */}
                            <circle
                              cx={x}
                              cy={y}
                              r="6"
                              fill="#4f46e5"
                              stroke="white"
                              strokeWidth="2"
                              className="hover:r-8 transition-all cursor-pointer"
                            />

                            {/* Value label */}
                            <text
                              x={x}
                              y={y - 15}
                              textAnchor="middle"
                              className="text-xs font-medium fill-gray-700"
                            >
                              {point.logins}
                            </text>

                            {/* Date label */}
                            <text
                              x={x}
                              y="185"
                              textAnchor="middle"
                              className="text-xs fill-gray-500"
                            >
                              {point.shortDate}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  )}

                  {/* Y-axis labels */}
                  {(() => {
                    const maxLogins = Math.max(...chartData.map(d => d.logins), 1);
                    const steps = Math.min(5, maxLogins + 1);
                    return Array.from({ length: steps }, (_, i) => {
                      const value = Math.round((maxLogins * i) / (steps - 1));
                      const y = 160 - (value / maxLogins) * 140;
                      return (
                        <text
                          key={i}
                          x="-10"
                          y={y + 4}
                          textAnchor="end"
                          className="text-xs fill-gray-500"
                        >
                          {value}
                        </text>
                      );
                    });
                  })()}
                </g>

                {/* Chart title */}
                <text x="400" y="15" textAnchor="middle" className="text-sm font-medium fill-gray-700">
                  Daily Login Count
                </text>
              </svg>

              {/* Chart statistics */}
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Total Logins</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {chartData.reduce((sum, day) => sum + day.logins, 0)}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Peak Day</p>
                  <p className="text-2xl font-bold text-green-600">
                    {Math.max(...chartData.map(d => d.logins))}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Avg/Day</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {(chartData.reduce((sum, day) => sum + day.logins, 0) / 7).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-gray-500">
              <div className="text-4xl mb-4">📈</div>
              <div className="text-center">
                <p className="text-lg font-medium">No login data available</p>
                <p className="text-sm">Chart will appear after login activity</p>
                <p className="text-xs mt-2">Click "Add Test Login" to see the chart</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Latest 5 Login History Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Latest 5 Login Attempts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Most recent login activity ({loginHistory.length} total entries)
          </p>
        </div>

        {latestLogins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {latestLogins.map((login, index) => (
                  <tr key={login.id} className={`hover:bg-gray-50 ${index === 0 ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        {index === 0 && <span className="text-blue-600 mr-2">📍</span>}
                        {formatDateTime(login.loginTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {login.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {login.device}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {login.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {login.ipAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        login.status === 'Success'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {login.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔐</div>
            <div className="text-center">
              <p className="text-lg font-medium">No login history found</p>
              <p className="text-sm">Your login attempts will appear here</p>
              <p className="text-xs mt-2">Click "Add Test Login" to see how it works</p>
            </div>
          </div>
        )}

        {latestLogins.length > 0 && loginHistory.length > 5 && (
          <div className="bg-gray-50 px-4 py-3 text-center border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing latest 5 of {loginHistory.length} total login attempts
            </p>
          </div>
        )}
      </div>
    </div>
  );
}