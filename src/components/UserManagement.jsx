import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import UserModal from './UserModal';
import { useConfirmationContext } from '../contexts/ConfirmationContext';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const { showSuccess, showError } = useToast();
  const { showConfirmation } = useConfirmationContext();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAllUsers();
      console.log('Fetched users:', data); // Debug log
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching users:', err);
      showError('Failed to fetch users: ' + err.message);
      setUsers([]); // Set empty array instead of dummy data
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Filter by search term (username or email)
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== 'All') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('All');
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

 const handleDeleteUser = async (user) => {
    const confirmed = await showConfirmation({
      title: 'Delete User',
      message: `Are you sure you want to delete "${user.username}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel'
    });

    if (confirmed) {
      try {
        await userAPI.deleteUser(user.id);
        
        // Update the users state by filtering out the deleted user
        setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
        
        // Show success message
        showSuccess(`User "${user.username}" deleted successfully`);
        
        // Refresh the page after successful deletion
        setTimeout(() => {
          window.location.reload();
        }, 1500);
        
      } catch (err) {
        console.error('Delete error:', err);
        showError('Failed to delete user: ' + err.message);
      }
    }
};

  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        await userAPI.updateUser(selectedUser.id, userData);
        const updatedUsers = users.map(user =>
          user.id === selectedUser.id ? { ...user, ...userData } : user
        );
        setUsers(updatedUsers);
      } else {
        const newUser = await userAPI.createUser(userData);
        setUsers([...users, newUser]);
      }
      showSuccess(`User ${selectedUser ? 'updated' : 'created'} successfully`);
    } catch (err) {
      showError('Failed to save user: ' + err.message);
    }
  };

  // Get unique roles from users data for dynamic dropdown
  const availableRoles = [...new Set(users.map(user => user.role))].sort();

  // Helper function to format role names for display
  const formatRoleName = (role) => {
    const roleMap = {
      'StationOperator': 'Station Operator',
      'EvOwner': 'EV Owner',
      'Backoffice': 'Backoffice',
      'Customer': 'Customer'
    };
    return roleMap[role] || role;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex items-center space-x-3">
          <div className="ev-spinner"></div>
          <div className="text-lg text-gray-600">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header Section */}
      <div className="ev-card-gradient p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-white/80">Manage and oversee all system users</p>
          </div>
          <button
            onClick={handleCreateUser}
            className="btn-ev-secondary bg-white/20 border-white/30 text-white hover:bg-white/30"
          >
           
            Add New User
          </button>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="ev-card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Search & Filters</h3>
          <p className="text-sm text-gray-600">Find users by name, email, or role</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search" className="ev-label">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Users
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="ev-input w-full"
            />
          </div>

          <div>
            <label htmlFor="roleFilter" className="ev-label">
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Filter by Role
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="ev-input w-full"
            >
              <option value="All">All Roles</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>
                  {formatRoleName(role)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={clearFilters}
              className="btn-ev-secondary w-full"
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Showing <span className="font-semibold text-ev-primary-600">{filteredUsers.length}</span> of <span className="font-semibold">{users.length}</span> users</span>
          </div>
          
          {(searchTerm || roleFilter !== 'All') && (
            <div className="flex items-center space-x-1 text-sm">
              <span className="text-gray-500">Filters active:</span>
              {searchTerm && (
                <span className="ev-badge-info">Search: {searchTerm}</span>
              )}
              {roleFilter !== 'All' && (
                <span className="ev-badge-info">Role: {formatRoleName(roleFilter)}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="ev-table">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="ev-table-header">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>User</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Contact</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Role</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-white uppercase tracking-wider">
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span>Actions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="ev-table-row">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10">
                        <div className="w-10 h-10 bg-ev-gradient rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === 'Backoffice'
                        ? 'bg-ev-secondary-100 text-ev-secondary-800'
                        : user.role === 'StationOperator'
                        ? 'bg-ev-accent-100 text-ev-accent-800'
                        : user.role === 'EvOwner'
                        ? 'bg-ev-energy-400/20 text-ev-energy-600'
                        : 'bg-ev-primary-100 text-ev-primary-800' // Customer or default
                    }`}>
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatRoleName(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-ev-primary-600 hover:text-white bg-ev-primary-50 hover:bg-ev-primary-500 border border-ev-primary-200 hover:border-ev-primary-500 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="inline-flex items-center px-3 py-1 rounded-lg text-red-600 hover:text-white bg-red-50 hover:bg-red-500 border border-red-200 hover:border-red-500 transition-all duration-200"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty States */}
        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-4">No users match your search criteria. Try adjusting your filters.</p>
            <button
              onClick={clearFilters}
              className="btn-ev-secondary"
            >
              Clear all filters
            </button>
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-ev-primary-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-ev-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to User Management</h3>
            <p className="text-gray-500 mb-4">Get started by creating your first user account.</p>
            <button
              onClick={handleCreateUser}
              className="btn-ev-primary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create First User
            </button>
          </div>
        )}
      </div>

      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSave={handleSaveUser}
        title={selectedUser ? 'Edit User' : 'Create New User'}
      />

      <Toast />
    </div>
  );
}