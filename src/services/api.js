// Use environment variable or fallback to proxy path
const API_BASE_URL = import.meta.env.VITE_API_URL;

const fetchWithCORS = async (url, options = {}) => {
  const defaultOptions = {
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, defaultOptions);

  if (!response.ok) {
    let errorMessage = 'Request failed';
    try {
      const error = await response.json();
      errorMessage = error.message || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const authAPI = {
  login: async (email, password) => {
    return fetchWithCORS(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData) => {
    const payload = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      role: userData.role || 'Customer'
    };

    return fetchWithCORS(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};

export const userAPI = {
  getAllUsers: async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get users error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  createUser: async (userData) => {
    const token = localStorage.getItem('token');
    const payload = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create user error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  updateUser: async (userId, userData) => {
    const token = localStorage.getItem('token');
    const payload = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role
    };

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update user error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  deleteUser: async (userId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Delete user error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // DELETE might return empty response
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return { success: true };
  },

  updateProfile: async (userId, userData) => {
    const token = localStorage.getItem('token');
    const payload = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role
    };

    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Update profile error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  getLoginHistory: async () => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/auth/login-history`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get login history error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  deactivateUser: async (userId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/users/${userId}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deactivate user error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  reactivateUser: async (userId) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/users/${userId}/reactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Reactivate user error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  getUserByNIC: async (nic) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/users/by-nic/${nic}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get user by NIC error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  getUserByEmail: async (email) => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_BASE_URL}/users/by-email/${email}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get user by email error:', response.status, errorText);
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
};