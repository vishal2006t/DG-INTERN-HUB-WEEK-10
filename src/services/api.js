import axios from 'axios';
import { jobsData } from '../data/jobs';

export const API_BASE_URL = 
  import.meta.env.VITE_API_BASE_URL || 
  import.meta.env.VITE_API_URL || 
  'http://localhost:5000/api';

// Create Centralized Axios Client
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dg_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Uniform error handling and 401 recovery
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      const storedToken = localStorage.getItem('dg_auth_token');
      if (storedToken) {
        localStorage.removeItem('dg_auth_token');
        localStorage.removeItem('dg_user');
      }
    }

    const message = 
      error.response?.data?.message || 
      (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join(', ') : null) || 
      error.message || 
      'An unexpected network error occurred';

    const customError = new Error(message);
    customError.status = error.response?.status;
    customError.errors = error.response?.data?.errors;
    customError.data = error.response?.data;
    return Promise.reject(customError);
  }
);

export const api = {
  // Authentication Endpoints
  auth: {
    register: async (userData) => {
      return apiClient.post('/auth/register', userData);
    },
    login: async (credentials) => {
      return apiClient.post('/auth/login', credentials);
    },
    getMe: async () => {
      return apiClient.get('/auth/me');
    },
    logout: async () => {
      try {
        await apiClient.post('/auth/logout');
      } catch (err) {
        console.info('[Auth] Server logout notification error (non-fatal):', err.message);
      } finally {
        localStorage.removeItem('dg_auth_token');
        localStorage.removeItem('dg_user');
      }
    }
  },

  // User Profile & Admin Management Endpoints
  users: {
    getProfile: async () => {
      return apiClient.get('/users/profile');
    },
    updateProfile: async (profileData) => {
      return apiClient.put('/users/profile', profileData);
    },
    deleteProfile: async () => {
      return apiClient.delete('/users/profile');
    },
    getAllAdmin: async (params = {}) => {
      const q = new URLSearchParams();
      if (params.role && params.role !== 'All') q.set('role', params.role);
      if (params.search) q.set('search', params.search);
      if (params.page) q.set('page', params.page);
      if (params.limit) q.set('limit', params.limit);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient.get(`/users${qs}`);
    },
    updateRoleAdmin: async (id, role) => {
      return apiClient.put(`/users/${id}/role`, { role });
    },
    deleteAdmin: async (id) => {
      return apiClient.delete(`/users/${id}`);
    }
  },

  // Jobs Endpoints
  jobs: {
    getAll: async (params = {}) => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.set('search', params.search);
      if (params.category && params.category !== 'All') queryParams.set('category', params.category);
      if (params.location && params.location !== 'All') queryParams.set('location', params.location);
      if (params.workType && params.workType !== 'All') queryParams.set('workType', params.workType);
      if (params.type && params.type !== 'All') queryParams.set('type', params.type);
      if (params.skill && params.skill !== 'All') queryParams.set('skill', params.skill);
      if (params.featured) queryParams.set('featured', params.featured);
      if (params.sort) queryParams.set('sort', params.sort);
      if (params.page) queryParams.set('page', params.page);
      if (params.limit) queryParams.set('limit', params.limit);

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';

      try {
        const response = await apiClient.get(`/jobs${qs}`);
        return response;
      } catch (err) {
        console.warn('[API fallback] Server job query failed, providing cached dataset:', err.message);
        let list = [...jobsData];
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter((j) => 
            j.title?.toLowerCase().includes(s) || 
            j.company?.toLowerCase().includes(s) ||
            j.location?.toLowerCase().includes(s)
          );
        }
        if (params.category && params.category !== 'All') {
          list = list.filter((j) => j.category === params.category);
        }
        if (params.workType && params.workType !== 'All') {
          list = list.filter((j) => j.workType === params.workType);
        }
        if (params.type && params.type !== 'All') {
          list = list.filter((j) => j.type?.toLowerCase() === params.type.toLowerCase());
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
        const response = await apiClient.get(`/jobs/${id}`);
        return response.data;
      } catch (err) {
        const fallback = jobsData.find((j) => j.id === id || j.slug === id || j._id === id);
        if (fallback) return fallback;
        throw err;
      }
    },

    create: async (jobData) => {
      return apiClient.post('/jobs', jobData);
    },

    update: async (id, jobData) => {
      return apiClient.put(`/jobs/${id}`, jobData);
    },

    delete: async (id) => {
      return apiClient.delete(`/jobs/${id}`);
    }
  },

  // Applications Endpoints
  applications: {
    apply: async (applicationData) => {
      return apiClient.post('/applications', applicationData);
    },

    getMy: async () => {
      return apiClient.get('/applications/my');
    },

    getById: async (id) => {
      return apiClient.get(`/applications/${id}`);
    },

    updateStatus: async (id, statusData) => {
      return apiClient.put(`/applications/${id}/status`, statusData);
    },

    delete: async (id) => {
      return apiClient.delete(`/applications/${id}`);
    },

    getRecruiter: async (params = {}) => {
      const q = new URLSearchParams();
      if (params.jobId) q.set('jobId', params.jobId);
      if (params.status && params.status !== 'All') q.set('status', params.status);
      if (params.search) q.set('search', params.search);
      const qs = q.toString() ? `?${q.toString()}` : '';
      return apiClient.get(`/applications/recruiter${qs}`);
    },

    exportCSV: async () => {
      return apiClient.get('/applications/export/csv', {
        responseType: 'blob'
      });
    },

    uploadResume: async (file) => {
      const formData = new FormData();
      formData.append('resume', file);
      return apiClient.post('/applications/upload-resume', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    }
  },

  // Persistent Notifications Endpoints
  notifications: {
    getAll: async () => {
      return apiClient.get('/notifications');
    },
    markAsRead: async (id) => {
      return apiClient.put(`/notifications/${id}/read`);
    },
    markAllAsRead: async () => {
      return apiClient.put('/notifications/read-all');
    }
  },

  // Platform & Performance Analytics Endpoints
  analytics: {
    getAdmin: async () => {
      return apiClient.get('/analytics/admin');
    },
    getRecruiter: async () => {
      return apiClient.get('/analytics/recruiter');
    }
  }
};

export default api;
