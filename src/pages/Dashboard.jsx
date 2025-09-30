import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import UserManagement from '../components/UserManagement';
import LoginHistory from '../components/LoginHistory';
import StationManagement from '../components/StationManagement';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user.username || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || ''
  });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setProfileError('');
    setProfileSuccess('');
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setProfileData({
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || ''
    });
    setProfileError('');
    setProfileSuccess('');
  };

  const handleSaveProfile = async () => {
    try {
      setProfileError('');

      // Update local storage and state
      const newUserData = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(newUserData));
      setUser(newUserData);

      setIsEditingProfile(false);
      setProfileSuccess('Profile updated successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError('Failed to update profile: ' + err.message);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="ev-card p-8">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-ev-gradient rounded-2xl flex items-center justify-center charging-animation">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-3xl font-bold ev-gradient-text mb-2">
                    Welcome back, {user.username || user.name || 'User'}!
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Ready to power up your next journey with smart EV charging.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="ev-stat-card bg-gradient-to-br from-ev-primary-50 to-ev-primary-100 border-2 border-ev-primary-200">
                  <div className="ev-stat-icon">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-ev-primary-800 text-lg mb-1">Total Bookings</h3>
                  <p className="text-3xl font-bold text-ev-primary-600 mb-2">5</p>
                  <p className="text-sm text-ev-primary-700">Charging sessions completed</p>
                </div>
                
                <div className="ev-stat-card bg-gradient-to-br from-ev-energy-400/10 to-ev-energy-500/20 border-2 border-ev-energy-400/30">
                  <div className="w-12 h-12 bg-gradient-to-r from-ev-energy-400 to-ev-energy-600 rounded-xl flex items-center justify-center text-white mb-4">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-ev-energy-800 text-lg mb-1">Active Sessions</h3>
                  <p className="text-3xl font-bold text-ev-energy-600 mb-2">1</p>
                  <p className="text-sm text-ev-energy-700">Currently charging</p>
                </div>
                
                <div className="ev-stat-card bg-gradient-to-br from-ev-secondary-50 to-ev-secondary-100 border-2 border-ev-secondary-200">
                  <div className="w-12 h-12 bg-ev-secondary-gradient rounded-xl flex items-center justify-center text-white mb-4">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                  </div>
                  <h3 className="font-bold text-ev-secondary-800 text-lg mb-1">Available Stations</h3>
                  <p className="text-3xl font-bold text-ev-secondary-600 mb-2">12</p>
                  <p className="text-sm text-ev-secondary-700">Ready for charging</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'stations':
        return <StationManagement />;
      case 'bookings':
        return (
          <div className="ev-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-ev-gradient rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold ev-gradient-text">My Bookings</h2>
            </div>
            <p className="text-gray-600 text-lg">View and manage your charging station bookings.</p>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'loginHistory':
        return <LoginHistory />;
      case 'profile':
        return (
          <div className="ev-card p-8">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-ev-gradient rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                  </svg>
                </div>
                <h2 className="text-3xl font-bold ev-gradient-text">Profile Settings</h2>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={handleEditProfile}
                  className="btn-ev-primary"
                >
                  Edit Profile
                </button>
              )}
            </div>

            {profileError && (
              <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-6 bg-ev-primary-50 border-2 border-ev-primary-200 text-ev-primary-700 px-4 py-3 rounded-xl flex items-center space-x-3">
                <svg className="w-5 h-5 text-ev-primary-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{profileSuccess}</span>
              </div>
            )}

            <div className="space-y-6">
              <div className="ev-form-group">
                <label className="ev-label flex items-center space-x-2">
                  <svg className="w-4 h-4 text-ev-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Username</span>
                </label>
                {isEditingProfile ? (
                  <input
                    type="text"
                    name="username"
                    value={profileData.username}
                    onChange={handleProfileChange}
                    className="ev-input w-full"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{user.username}</p>
                )}
              </div>

              <div className="ev-form-group">
                <label className="ev-label flex items-center space-x-2">
                  <svg className="w-4 h-4 text-ev-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                  <span>Email</span>
                </label>
                {isEditingProfile ? (
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    className="ev-input w-full"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{user.email}</p>
                )}
              </div>

              <div className="ev-form-group">
                <label className="ev-label flex items-center space-x-2">
                  <svg className="w-4 h-4 text-ev-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Phone</span>
                </label>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    className="ev-input w-full"
                  />
                ) : (
                  <p className="mt-1 text-gray-900 font-medium bg-gray-50 px-4 py-3 rounded-xl">{user.phone || 'Not provided'}</p>
                )}
              </div>

              <div className="ev-form-group">
                <label className="ev-label flex items-center space-x-2">
                  <svg className="w-4 h-4 text-ev-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <span>Account Type</span>
                </label>
                <div className="mt-1">
                  <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${
                    user.role === 'Backoffice'
                      ? 'ev-badge-info'
                      : 'ev-badge-success'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {isEditingProfile && (
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleCancelEdit}
                  className="btn-ev-secondary"
                >
                  Cancel Changes
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="btn-ev-primary"
                >
                  Save Profile
                </button>
              </div>
            )}
          </div>
        );
      case 'settings':
        return (
          <div className="ev-card p-8">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-ev-gradient rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 15a3 3 0 003-3 3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3zm1.5-7.5A1.5 1.5 0 0115 6a1.5 1.5 0 00-1.5-1.5A1.5 1.5 0 0012 6a1.5 1.5 0 001.5 1.5z"/>
                </svg>
              </div>
              <h2 className="text-3xl font-bold ev-gradient-text">Settings</h2>
            </div>
            <p className="text-gray-600 text-lg">Manage your account settings and charging preferences.</p>
          </div>
        );
      default:
        return (
          <div className="ev-card p-8 text-center">
            <div className="w-16 h-16 bg-ev-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Select a Menu Item</h3>
            <p className="text-gray-500">Choose from the sidebar to explore EV charging features</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-ev-primary-50/50 via-white to-ev-secondary-50/50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}