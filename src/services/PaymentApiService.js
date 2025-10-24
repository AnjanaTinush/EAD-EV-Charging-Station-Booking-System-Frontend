const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const getTokenHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const paymentAPI = {
  // Fetch the list of financial records. Optional filters can be passed
  // as an object and will be serialized as query params.
  getFinancials: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((k) => {
      if (filters[k] !== undefined && filters[k] !== null && filters[k] !== '') {
        params.append(k, filters[k]);
      }
    });

    const url = `${API_BASE_URL}/financial${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getTokenHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Update a financial record (e.g., change status)
  updateFinancial: async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/financial/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getTokenHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Create a new financial record
  createFinancial: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/financial`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getTokenHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Patch a financial record (partial update) - useful for status changes
  patchFinancial: async (id, payload) => {
    const response = await fetch(`${API_BASE_URL}/financial/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...getTokenHeader(),
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Delete a financial record
  deleteFinancial: async (id) => {
    const response = await fetch(`${API_BASE_URL}/financial/${id}`, {
      method: 'DELETE',
      headers: {
        ...getTokenHeader(),
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    // Some APIs return empty body on delete
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) return response.json();
    return { success: true };
  },
};

export default paymentAPI;
