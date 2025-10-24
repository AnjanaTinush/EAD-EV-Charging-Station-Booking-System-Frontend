import { useState, useEffect } from 'react';
import { userAPI } from '../services/api';
import { useToast } from '../hooks/useToast';
import { useConfirmationContext } from '../contexts/ConfirmationContext';
import { useErrorContext } from '../contexts/ErrorContext';
import Toast from './Toast';

export default function ManageAccess() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byRole: {}
  });
  
  const { showSuccess, showError } = useToast();
  const { showConfirmation } = useConfirmationContext();
  const { showError: showValidationError } = useErrorContext();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = users.length;
    const active = users.filter(user => user.isActive).length;
    const inactive = total - active;
    
    const byRole = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    setStats({ total, active, inactive, byRole });
  };

  const handleToggleUserStatus = async (user) => {
    const action = user.isActive ? 'deactivate' : 'activate';
    const actionText = user.isActive ? 'Deactivate' : 'Activate';
    
    const confirmed = await showConfirmation({
      title: `${actionText} User`,
      message: `Are you sure you want to ${action} "${user.username}"?`,
      confirmText: actionText,
      cancelText: 'Cancel'
    });

    if (!confirmed) return;

    try {
      await userAPI.toggleUserStatus(user.id, !user.isActive);
      
      // Update user status locally
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === user.id ? { ...u, isActive: !u.isActive } : u
        )
      );
      
      showSuccess(`User "${user.username}" ${action}d successfully!`);
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      showValidationError(error.message);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nic.includes(searchTerm);
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesStatus = filterStatus === 'All' || 
                         (filterStatus === 'Active' && user.isActive) ||
                         (filterStatus === 'Inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const roles = ['All', ...new Set(users.map(user => user.role))];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 border-4 border-ev-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-600">Loading users...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <Toast />
      
      {/* Header */}
      <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Access</h1>
          <p className="mt-2 text-gray-600">Control user access and permissions in your EV charging network</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="ev-card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ev-card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ev-card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Inactive Users</h3>
                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="ev-card">
          <div className="p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-100">
                <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/>
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">Active Rate</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ev-card">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="ev-input pl-10 w-full"
                  placeholder="Search by username, email, or NIC..."
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="ev-input w-full"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="ev-input w-full"
              >
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="ev-card">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">User Access Control</h2>
            <div className="text-sm text-gray-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-ev-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-ev-primary-600">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">NIC: {user.nic}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'Backoffice' ? 'bg-purple-100 text-purple-800' :
                          user.role === 'StationOperator' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md transition-all duration-200 ${
                            user.isActive
                              ? 'text-red-700 bg-red-100 hover:bg-red-200 hover:text-red-800'
                              : 'text-green-700 bg-green-100 hover:bg-green-200 hover:text-green-800'
                          }`}
                        >
                          {user.isActive ? (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"/>
                              </svg>
                              Deactivate
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                              </svg>
                              Activate
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}