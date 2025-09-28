const API_BASE_URL = '/api';

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
    return fetchWithCORS(`${API_BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  },

  createUser: async (userData) => {
    const token = localStorage.getItem('token');
    const payload = {
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      role: userData.role
    };

    return fetchWithCORS(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  },

  updateUser: async (userId, userData) => {
    const token = localStorage.getItem('token');
    return fetchWithCORS(`${API_BASE_URL}/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (userId) => {
    const token = localStorage.getItem('token');
    return fetchWithCORS(`${API_BASE_URL}/users/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }
};