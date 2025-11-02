import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getUsers: (params) => api.get('/users', { params }),
};

// Inventory API
export const inventoryAPI = {
  getInventory: (params) => api.get('/inventory', { params }),
  getInventoryItem: (id) => api.get(`/inventory/${id}`),
  addInventory: (data) => api.post('/inventory', data),
  updateInventory: (id, data) => api.put(`/inventory/${id}`, data),
  deleteInventory: (id) => api.delete(`/inventory/${id}`),
};

// Voting API
export const votingAPI = {
  submitVote: (data) => api.post('/voting/vote', data),
  getMyVotes: () => api.get('/voting/my-votes'),
  getResults: (params) => api.get('/voting/results', { params }),
  getTrending: () => api.get('/voting/trending'),
};

// Allocation API
export const allocationAPI = {
  getAllocations: (params) => api.get('/allocations', { params }),
  createAllocation: (data) => api.post('/allocations', data),
  redeemAllocation: (id) => api.put(`/allocations/${id}/redeem`),
  getMyAllocations: () => api.get('/allocations/my-allocations'),
};

// Supplier API
export const supplierAPI = {
  getSuppliers: () => api.get('/suppliers'),
  getSupplierDonations: (id) => api.get(`/suppliers/${id}/donations`),
  getSupplierStats: (id) => api.get(`/suppliers/${id}/stats`),
};

// Analytics API
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getDemand: (params) => api.get('/analytics/demand', { params }),
  getInventoryHealth: () => api.get('/analytics/inventory-health'),
  getStudentEngagement: () => api.get('/analytics/student-engagement'),
  getCompliance: () => api.get('/analytics/compliance'),
};

// NFT API
export const nftAPI = {
  getMyNFTs: () => api.get('/nft/my-nfts'),
  getNFT: (id) => api.get(`/nft/${id}`),
  getNFTsByType: (type) => api.get(`/nft/type/${type}`),
};

// POAS API
export const poasAPI = {
  calculateAll: () => api.get('/poas/calculate-all'),
  getStudentScore: (studentId) => api.get(`/poas/student/${studentId}`),
  getMyScore: () => api.get('/poas/my-score'),
  getRecommendations: (itemId, limit = 10) => api.get(`/poas/recommendations/${itemId}?limit=${limit}`),
  calculateBatch: (studentIds) => api.post('/poas/calculate-batch', { student_ids: studentIds }),
};

export default api;

