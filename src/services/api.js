import { jobsData } from '../data/jobs';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper to get auth header
const getAuthHeaders = () => {
  const token = localStorage.getItem('dg_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Generic fetch wrapper with graceful error handling
const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...getAuthHeaders(),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }
    return data;
  } catch (error) {
    console.warn(`[API] Error on ${url}:`, error.message);
    throw error;
  }
};

export const api = {
  // Auth endpoints
  auth: {
    register: async (userData) => {
      return fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },
    login: async (credentials) => {
      return fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
    },
    getMe: async () => {
      return fetchWithAuth('/auth/me');
    },
    logout: async () => {
      try {
        await fetchWithAuth('/auth/logout', { method: 'POST' });
      } catch {
        // ignore logout errors
      }
      localStorage.removeItem('dg_auth_token');
      localStorage.removeItem('dg_user');
    }
  },

  // Users endpoints
  users: {
    getProfile: async () => {
      return fetchWithAuth('/users/profile');
    },
    updateProfile: async (profileData) => {
      return fetchWithAuth('/users/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
    }
  },

  // Jobs endpoints
  jobs: {
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set('search', params.search);
      if (params.category && params.category !== 'All') queryParams.set('category', params.category);
      if (params.workType && params.workType !== 'All') queryParams.set('workType', params.workType);
      if (params.type && params.type !== 'All') queryParams.set('type', params.type);
      if (params.sort) queryParams.set('sort', params.sort);
      if (params.page) queryParams.set('page', params.page);
      if (params.limit) queryParams.set('limit', params.limit);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

      try {
        const result = await fetchWithAuth(`/jobs${qs}`);
        return result;
      } catch (err) {
        // Graceful fallback to local dataset if server is warming up
        console.info('[API Fallback] Serving local jobs data:', err.message);
        let list = [...jobsData];
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter((j) => j.title.toLowerCase().includes(s) || j.company.toLowerCase().includes(s));
        }
        if (params.category && params.category !== 'All') {
          list = list.filter((j) => j.category === params.category);
        }
        if (params.workType && params.workType !== 'All') {
          list = list.filter((j) => j.workType === params.workType);
        }
        return {
          success: true,
          page: 1,
          limit: 10,
          total: list.length,
          totalPages: Math.ceil(list.length / 10) || 1,
          data: list
        };
      }
    },

    getById: async (id) => {
      try {
        const result = await fetchWithAuth(`/jobs/${id}`);
        return result.data;
      } catch (err) {
        const fallback = jobsData.find((j) => j.id === id || j.slug === id);
        if (fallback) return fallback;
        throw err;
      }
    },

    create: async (jobData) => {
      return fetchWithAuth('/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
      });
    },

    update: async (id, jobData) => {
      return fetchWithAuth(`/jobs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(jobData)
      });
    },

    delete: async (id) => {
      return fetchWithAuth(`/jobs/${id}`, {
        method: 'DELETE'
      });
    }
  },

  // Applications endpoints
  applications: {
    apply: async (applicationData) => {
      return fetchWithAuth('/applications', {
        method: 'POST',
        body: JSON.stringify(applicationData)
      });
    },

    getMy: async () => {
      return fetchWithAuth('/applications/my');
    },

    getById: async (id) => {
      return fetchWithAuth(`/applications/${id}`);
    },

    updateStatus: async (id, statusData) => {
      return fetchWithAuth(`/applications/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify(statusData)
      });
    },

    delete: async (id) => {
      return fetchWithAuth(`/applications/${id}`, {
        method: 'DELETE'
      });
    }
  }
};
