import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import UserModal from './UserModal';
import { useConfirmation } from '../hooks/useConfirmation.jsx';
import { useToast } from '../hooks/useToast';
import Toast from './Toast';
import database from '../utils/database';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  
  const { showSuccess, showError } = useToast();
  const { showConfirmation, ConfirmationComponent } = useConfirmation();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);

      // Initialize database
      await database.init();

      // Try to fetch from API first
      try {
        const response = await userAPI.getAllUsers();
        const apiUsers = response.users || response || [];

        // Sync API users to local database
        for (const user of apiUsers) {
          await database.syncUserFromAPI(user);
        }

        setUsers(apiUsers);
      } catch (apiError) {
        // If API fails, load from local database
        console.warn('API failed, loading from local database:', apiError);
        const localUsers = await database.getAllUsers();
        setUsers(localUsers);

        if (localUsers.length === 0) {
          showError('No users found. Please check your connection.');
        }
      }
    } catch (err) {
      showError('Failed to fetch users: ' + err.message);
      setUsers([]);
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
      confirmButtonClass: 'bg-red-500 hover:bg-red-600'
    });

    if (confirmed) {
      try {
        await userAPI.deleteUser(user.id);
        await database.deleteUser(user.id);
        setUsers(users.filter(u => u.id !== user.id));
        showSuccess(`User "${user.username}" deleted successfully`);
      } catch (err) {
        showError('Failed to delete user: ' + err.message);
      }
    }
  };

  const handleDeactivateUser = async (user) => {
    const confirmed = await showConfirmation({
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate "${user.username}"? The user will not be able to access the system until reactivated.`,
      confirmText: 'Deactivate',
      confirmButtonClass: 'bg-yellow-500 hover:bg-yellow-600'
    });

    if (confirmed) {
      try {
        await userAPI.deactivateUser(user.id);
        await database.deactivateUser(user.id);
        const updatedUsers = users.map(u =>
          u.id === user.id ? { ...u, isActive: false } : u
        );
        setUsers(updatedUsers);
        showSuccess(`User "${user.username}" deactivated successfully`);
      } catch (err) {
        showError('Failed to deactivate user: ' + err.message);
      }
    }
  };

  const handleReactivateUser = async (user) => {
    try {
      await userAPI.reactivateUser(user.id);
      await database.reactivateUser(user.id);
      const updatedUsers = users.map(u =>
        u.id === user.id ? { ...u, isActive: true } : u
      );
      setUsers(updatedUsers);
      showSuccess(`User "${user.username}" reactivated successfully`);
    } catch (err) {
      showError('Failed to reactivate user: ' + err.message);
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      if (selectedUser) {
        const updatedUser = await userAPI.updateUser(selectedUser.id, userData);
        await database.updateUser(selectedUser.id, userData);
        const updatedUsers = users.map(user =>
          user.id === selectedUser.id ? { ...user, ...userData } : user
        );
        setUsers(updatedUsers);
      } else {
        const newUser = await userAPI.createUser(userData);
        await database.addUser(newUser);
        setUsers([...users, newUser]);
      }
      showSuccess(`User ${selectedUser ? 'updated' : 'created'} successfully`);
    } catch (err) {
      showError('Failed to save user: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={handleCreateUser}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add New User
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <input
              type="text"
              id="search"
              placeholder="Search by username or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <select
              id="roleFilter"
              value={roleFilter}
              onChange={handleRoleFilterChange}
              className="w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="All">All Roles</option>
              <option value="Customer">Customer</option>
              <option value="Backoffice">Backoffice</option>
            </select>
          </div>

          <div>
            <button
              onClick={clearFilters}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium border border-gray-300"
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NIC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${!user.isActive ? 'opacity-60' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.nic || user.NIC || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Backoffice' || user.role === '0'
                        ? 'bg-blue-100 text-blue-800'
                        : user.role === 'StationOperator' || user.role === '1'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role === '0' ? 'Backoffice' : user.role === '1' ? 'StationOperator' : user.role === '2' ? 'EvOwner' : user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-md transition-colors"
                    >
                      Edit
                    </button>
                    {user.isActive ? (
                      <button
                        onClick={() => handleDeactivateUser(user)}
                        className="text-yellow-600 hover:text-yellow-900 bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded-md transition-colors"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivateUser(user)}
                        className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md transition-colors"
                      >
                        Reactivate
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteUser(user)}
                      className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && users.length > 0 && (
          <div className="text-center py-8 text-gray-500">
            No users match your search criteria. Try adjusting your filters.
          </div>
        )}

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found. Create your first user.
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