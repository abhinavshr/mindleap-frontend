import axios from 'axios';

const adminApi = axios.create({
    baseURL:         import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request interceptor — attach admin token ─────────────────────────────────
adminApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor — handle expired/invalid admin session ─────────────
adminApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminRole');
            localStorage.removeItem('adminEmail');
            localStorage.removeItem('adminUsername');
            window.location.href = '/admin/login';
        }
        return Promise.reject(error);
    }
);

export default adminApi;