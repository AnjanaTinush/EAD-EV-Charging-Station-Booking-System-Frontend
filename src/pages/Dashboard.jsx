import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import UserManagement from '../components/UserManagement';

export default function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome, {user.username || user.name || 'User'}!
              </h2>
              <p className="text-gray-600 mb-4">
                You have successfully logged in to the EV Charging Station Booking System.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Total Bookings</h3>
                  <p className="text-2xl font-bold text-blue-600">5</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900">Active Sessions</h3>
                  <p className="text-2xl font-bold text-green-600">1</p>
                </div>
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900">Available Stations</h3>
                  <p className="text-2xl font-bold text-yellow-600">12</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'stations':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Charging Stations</h2>
            <p className="text-gray-600">Find and book charging stations near you.</p>
          </div>
        );
      case 'bookings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Bookings</h2>
            <p className="text-gray-600">View and manage your charging station bookings.</p>
          </div>
        );
      case 'users':
        return <UserManagement />;
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-gray-900">{user.role}</p>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Manage your account settings and preferences.</p>
          </div>
        );
      default:
        return <div>Select a menu item</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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