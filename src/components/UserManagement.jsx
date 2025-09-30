import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import UserModal from './UserModal';
import { useConfirmation } from '../hooks/useConfirmation.jsx';
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
  const { showConfirmation, ConfirmationComponent } = useConfirmation();

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

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.users || response || []);
    } catch (err) {
      showError('Failed to fetch users: ' + err.message);
      setUsers([
        { id: 1, username: 'john_doe', email: 'john@example.com', phone: '123-456-7890', role: 'Customer' },
        { id: 2, username: 'jane_admin', email: 'jane@example.com', phone: '098-765-4321', role: 'Backoffice' },
        { id: 3, username: 'bob_user', email: 'bob@example.com', phone: '555-123-4567', role: 'Customer' }
      ]);
    } finally {
      setLoading(false);
    }
  }, [showError]);

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
        setUsers(users.filter(u => u.id !== user.id));
        showSuccess(`User "${user.username}" deleted successfully`);
      } catch (err) {
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
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.username}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Backoffice'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-indigo-600 hover:text-indigo-900 bg-indigo-100 hover:bg-indigo-200 px-3 py-1 rounded-md transition-colors"
                    >
                      Edit
                    </button>
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