import axios from 'axios';

const api = axios.create({
    baseURL:         import.meta.env.VITE_API_URL,
    withCredentials: true,                          // send cookies with every request
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
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh the token
                const res = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh-token`,
                    {},
                    { withCredentials: true }
                );

                const newToken = res.data.accessToken;
                localStorage.setItem('accessToken', newToken);

                // Retry original request with new token
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                // Refresh failed — clear token and redirect to login
                localStorage.removeItem('accessToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;