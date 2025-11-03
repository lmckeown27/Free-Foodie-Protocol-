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
  getSupplierImpact: (id) => api.get(`/suppliers/${id}/impact`),
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

// Notifications API
export const notificationsAPI = {
  getNotifications: (params = {}) => api.get('/notifications', { params }),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/mark-all-read'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
  createNotification: (data) => api.post('/notifications', data),
};

// Volunteer API
export const volunteerAPI = {
  logHours: (data) => api.post('/volunteers/log', data),
  getMyHours: () => api.get('/volunteers/my-hours'),
  getPendingHours: () => api.get('/volunteers/pending'),
  getAllHours: (params) => api.get('/volunteers/all', { params }),
  verifyHours: (id, data) => api.put(`/volunteers/${id}/verify`, data),
  getLeaderboard: (limit = 10) => api.get(`/volunteers/leaderboard?limit=${limit}`),
  getOpportunities: () => api.get('/volunteers/opportunities'),
  getStats: () => api.get('/volunteers/stats'),
};

// Governance API
export const governanceAPI = {
  createProposal: (data) => api.post('/governance/proposals', data),
  getProposals: (params) => api.get('/governance/proposals', { params }),
  getProposal: (id) => api.get(`/governance/proposals/${id}`),
  voteOnProposal: (id, data) => api.post(`/governance/proposals/${id}/vote`, data),
  addMultiSigApproval: (id, data) => api.post(`/governance/proposals/${id}/multi-sig`, data),
  executeProposal: (id, data) => api.post(`/governance/proposals/${id}/execute`, data),
  getStats: () => api.get('/governance/stats'),
};

// Wallet API
export const walletAPI = {
  getMyAssets: () => api.get('/wallet/assets/my'),
  getActivePantryWallet: () => api.get('/wallet/vault/active'),
  getTransactions: (params) => api.get('/wallet/transactions', { params }),
};

export default api;

