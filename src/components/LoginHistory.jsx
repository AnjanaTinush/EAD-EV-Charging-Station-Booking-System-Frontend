import { useState, useEffect } from 'react';

export default function LoginHistory() {
  const [loginHistory, setLoginHistory] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
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