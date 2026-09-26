import axios from "axios";
import { useAuthStore } from "../store/auth.store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    const isPublic = config.url?.includes("/public/");
    if (token && !isPublic && !config.url?.includes("/v1/auth/login")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const redirectToLogin = () => {
  const store = useAuthStore.getState();
  if (store.accessToken) {
    store.logout();
  }
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 429) {
      window.dispatchEvent(
        new CustomEvent('app:toast', {
          detail: {
            type: 'warning',
            title: 'Too many requests',
            message:
              error.response?.data?.message ||
              'Too many requests. Please try again in a moment.',
            duration: 5000,
          },
        })
      );
      return Promise.reject(error);
    }

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/v1/auth/login") ||
      originalRequest.url?.includes("/v1/auth/refresh") ||
      originalRequest.url?.includes("/public/") ||
      !originalRequest.headers?.Authorization
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/v1/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = response.data.token || response.data.accessToken;
      useAuthStore.getState().setAccessToken(newToken);

      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError);
      redirectToLogin();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
