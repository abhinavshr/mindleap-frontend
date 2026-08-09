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

// A 401 from any of these means "these credentials/tokens are wrong",
// not "your session expired mid-use" — so it should never trigger the
// refresh-token flow or a forced redirect. It should just reject and
// let the calling component show its own error message.
const NO_REFRESH_ENDPOINTS = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh-token',
    '/auth/forgot-password',
    '/auth/verify-reset-otp',
    '/auth/reset-password',
    '/admin/login',
];

const isNoRefreshEndpoint = (url = '') =>
    NO_REFRESH_ENDPOINTS.some((endpoint) => url.includes(endpoint));

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const requestUrl      = originalRequest?.url || '';

        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            isNoRefreshEndpoint(requestUrl)
        ) {
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

            localStorage.setItem('accessToken', newToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

            processQueue(null, newToken);

            originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
            return api(originalRequest);

        } catch (refreshError) {
            processQueue(refreshError, null);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');

            if (window.location.pathname !== '/login') {
                const redirect = encodeURIComponent(window.location.pathname + window.location.search);
                window.location.href = `/login?redirect=${redirect}`;
            }

            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;