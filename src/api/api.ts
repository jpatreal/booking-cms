import axios, { AxiosError } from 'axios';
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../stores/auth';

declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
    _skipAuthRefresh?: boolean;
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000',
  withCredentials: false,
});

let isRefreshing = false;
let pendingRequests: ((token: string | null) => void)[] = [];

export function setApiAccessToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

function applyAuthHeader(config: InternalAxiosRequestConfig | AxiosRequestConfig, token: string) {
  if (!config.headers) {
    config.headers = {};
  }

  if (typeof (config.headers as any).set === 'function') {
    (config.headers as any).set('Authorization', `Bearer ${token}`);
  } else {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
}

api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken && !config.headers?.Authorization) {
    applyAuthHeader(config, auth.accessToken);
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const response = error.response;
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined;

    if (!response || !originalRequest) {
      return Promise.reject(error);
    }

    const auth = useAuthStore();

    if (
      response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest._skipAuthRefresh &&
      auth.accessToken
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingRequests.push((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }
            applyAuthHeader(originalRequest, newToken);
            resolve(api(originalRequest as AxiosRequestConfig));
          });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await auth.refreshAccessToken();

        pendingRequests.forEach((cb) => cb(newToken));
        pendingRequests = [];

        applyAuthHeader(originalRequest, newToken);
        return api(originalRequest as AxiosRequestConfig);
      } catch (refreshErr) {
        pendingRequests.forEach((cb) => cb(null));
        pendingRequests = [];
        auth.logout();
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
