// services/api.js
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = process.env.REACT_APP_API_URL || "https://cyber-fraud-detection-4bdj.onrender.com/api";
const WS_URL = process.env.REACT_APP_WS_URL || "https://cyber-fraud-detection-4bdj.onrender.com";

console.log("🔗 API URL:", API_URL);
console.log("🔌 WebSocket URL:", WS_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 30000,
});

// Request interceptor for token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("❌ API Error:", error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// WebSocket Service
class WebSocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    
    this.socket = io(WS_URL, {
      auth: { token },
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    
    this.socket.on("connect", () => {
      console.log("WebSocket connected");
      this.emit("authenticate", { token });
    });
    
    this.socket.on("disconnect", () => {
      console.log("WebSocket disconnected");
    });
    
    this.socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });
    
    return this.socket;
  }
  
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      this.listeners.set(event, callback);
    }
  }
  
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }
  
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

export const websocketService = new WebSocketService();

// Auth Service
export const authService = {
  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data?.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    websocketService.disconnect();
  },
  
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
  
  getToken: () => localStorage.getItem("token"),
  
  isAuthenticated: () => !!localStorage.getItem("token"),
};

// Transaction Service
export const transactionService = {
  createTransaction: async (data) => {
    const response = await api.post("/transactions", data);
    return response.data;
  },
  
  getUserTransactions: async (params = {}) => {
    const response = await api.get("/transactions", { params });
    return response.data;
  },
  
  getTransactionById: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
  
  getFraudAlerts: async () => {
    const response = await api.get("/transactions/alerts");
    return response.data;
  },
  
  getTransactionStats: async () => {
    const response = await api.get("/transactions/stats");
    return response.data;
  },
  
  getFraudTrends: async (period = "week") => {
    const response = await api.get("/transactions/trends", { params: { period } });
    return response.data;
  },
  
  getRiskMetrics: async () => {
    const response = await api.get("/transactions/risk-metrics");
    return response.data;
  },
  
  reportTransaction: async (id, reason) => {
    const response = await api.post(`/transactions/${id}/report`, { reason });
    return response.data;
  },
};

// Analytics Service
export const analyticsService = {
  getUserBehavior: async () => {
    const response = await api.get("/analytics/behavior");
    return response.data;
  },
  
  getFraudPatterns: async () => {
    const response = await api.get("/analytics/patterns");
    return response.data;
  },
  
  getMLPerformance: async () => {
    const response = await api.get("/analytics/ml-performance");
    return response.data;
  },
  
  getRealTimeMetrics: async () => {
    const response = await api.get("/analytics/realtime");
    return response.data;
  },
};

// Security Service
export const securityService = {
  updatePassword: async (data) => {
    const response = await api.put("/security/password", data);
    return response.data;
  },
  
  enable2FA: async () => {
    const response = await api.post("/security/2fa/enable");
    return response.data;
  },
  
  verify2FA: async (code) => {
    const response = await api.post("/security/2fa/verify", { code });
    return response.data;
  },
  
  getSessions: async () => {
    const response = await api.get("/security/sessions");
    return response.data;
  },
  
  revokeSession: async (sessionId) => {
    const response = await api.delete(`/security/sessions/${sessionId}`);
    return response.data;
  },
  
  getSecurityLogs: async () => {
    const response = await api.get("/security/logs");
    return response.data;
  },
};

export default api;