const API_BASE_URL = 'http://localhost:5000/api';

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
    return fetchWithCORS(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
};