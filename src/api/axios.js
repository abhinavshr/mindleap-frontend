import axios from 'axios';

const api = axios.create({
    baseURL:         import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// ─── Request interceptor — attach access token ────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor — handle token expiry ───────────────────────────────
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Only handle 401 and only retry once
        if (error.response?.status !== 401 || originalRequest._retry) {
            return Promise.reject(error);
        }

        // If already refreshing, queue this request until refresh is done
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing            = true;

        try {
            // Use plain axios (not api) to avoid interceptor loop
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                {},
                { withCredentials: true }
            );

            const newToken = res.data.accessToken;

            // Save new token
            localStorage.setItem('accessToken', newToken);

            // Update default headers for future requests
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            // Unblock all queued requests
            processQueue(null, newToken);

            // Retry the original failed request with new token
            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);

        } catch (refreshError) {
            // Refresh failed — log out and redirect
            processQueue(refreshError, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            window.location.href = '/login';
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;