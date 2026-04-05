import axios from 'axios';

// Environment variable MUST be set in Vercel
const API_URL = process.env.REACT_APP_API_URL || "https://cyber-fraud-detection-backend.onrender.com/api";

console.log("🔗 API URL:", API_URL);

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// Auth APIs
export const authService = {
    register: async (userData) => {
        const response = await api.post("/auth/register", userData);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    login: async (credentials) => {
        const response = await api.post("/auth/login", credentials);
        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem("user");
        return userStr ? JSON.parse(userStr) : null;
    },
};

// Transaction APIs
export const transactionService = {
    createTransaction: async (transactionData) => {
        const response = await api.post("/transactions", transactionData);
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
};

export default api;