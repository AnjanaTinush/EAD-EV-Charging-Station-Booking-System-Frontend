import { useState, useEffect } from 'react';

export default function LoginHistory() {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    loadLoginHistory();
  }, []);

  const loadLoginHistory = () => {
    setLoading(true);

    // Get existing login history from localStorage
    const storedHistory = localStorage.getItem('loginHistory');
    let history = storedHistory ? JSON.parse(storedHistory) : [];

    // If no history exists, generate some initial mock data
    if (history.length === 0) {
      history = generateInitialMockData();
      localStorage.setItem('loginHistory', JSON.stringify(history));
    }

    setLoginHistory(history);
    processChartData(history);
    setLoading(false);
  };

  const generateInitialMockData = () => {
    const mockData = [];
    const currentDate = new Date();

    for (let i = 29; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setDate(date.getDate() - i);

      // Random number of logins per day (0-5)
      const loginCount = Math.floor(Math.random() * 6);

      for (let j = 0; j < loginCount; j++) {
        const loginTime = new Date(date);
        loginTime.setHours(Math.floor(Math.random() * 24));
        loginTime.setMinutes(Math.floor(Math.random() * 60));

        mockData.push({
          id: `${i}-${j}`,
          loginTime: loginTime.toISOString(),
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          device: ['Windows PC', 'iPhone', 'Android', 'Mac', 'iPad'][Math.floor(Math.random() * 5)],
          location: ['New York', 'London', 'Tokyo', 'Paris', 'Sydney'][Math.floor(Math.random() * 5)],
          status: Math.random() > 0.1 ? 'Success' : 'Failed'
        });
      }
    }

    return mockData.sort((a, b) => new Date(b.loginTime) - new Date(a.loginTime));
  };

  // Add new login entry (called from login process)
  const addLoginEntry = (status = 'Success') => {
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const newLogin = {
      id: Date.now().toString(),
      loginTime: new Date().toISOString(),
      ipAddress: generateRandomIP(),
      device: detectDevice(),
      location: getRandomLocation(),
      status: status,
      username: currentUser.username || 'Unknown'
    };

    const existingHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
    const updatedHistory = [newLogin, ...existingHistory].slice(0, 100); // Keep last 100 entries

    localStorage.setItem('loginHistory', JSON.stringify(updatedHistory));
    setLoginHistory(updatedHistory);
    processChartData(updatedHistory);
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

  const processChartData = (history) => {
    const loginsByDate = {};

    history.forEach(login => {
      const date = new Date(login.loginTime).toLocaleDateString();
      loginsByDate[date] = (loginsByDate[date] || 0) + 1;
    });

    const chartData = Object.entries(loginsByDate)
      .map(([date, count]) => ({
        date,
        logins: count
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-14); // Last 14 days

    setChartData(chartData);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
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
        <h2 className="text-2xl font-bold text-gray-900">Login History</h2>
        <button
          onClick={loadLoginHistory}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Refresh
        </button>
      </div>


      {/* Login Activity Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Login Activity (Last 14 Days)</h3>
        <div className="h-64 bg-gray-50 rounded-lg p-4">
          {chartData.length > 0 ? (
            <div className="h-full flex items-end justify-between space-x-1">
              {chartData.map((day, index) => {
                const maxLogins = Math.max(...chartData.map(d => d.logins), 1);
                const height = (day.logins / maxLogins) * 100;

                return (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div className="flex flex-col items-center justify-end h-48 w-full">
                      <div
                        className="bg-indigo-600 rounded-t-sm w-full min-h-[4px] transition-all duration-300 hover:bg-indigo-700 relative group"
                        style={{ height: `${height}%` }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {day.logins} login{day.logins !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2 transform -rotate-45 origin-left">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              No data available for chart
            </div>
          )}
        </div>
        <div className="mt-4 flex items-center text-sm text-gray-600">
          <div className="w-3 h-3 bg-indigo-600 rounded-sm mr-2"></div>
          <span>Daily Login Count</span>
        </div>
      </div>

      {/* Login History Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium text-gray-900">Recent Login Attempts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your recent login activity and security information
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loginHistory.slice(0, 20).map((login) => (
                <tr key={login.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDateTime(login.loginTime)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {login.ipAddress}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {login.device}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {login.location}
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

        {loginHistory.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No login history found.
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600 font-semibold">✓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Successful Logins</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loginHistory.filter(login => login.status === 'Success').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-md flex items-center justify-center">
                <span className="text-red-600 font-semibold">✗</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed Attempts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loginHistory.filter(login => login.status === 'Failed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 font-semibold">📱</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Logins</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loginHistory.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}