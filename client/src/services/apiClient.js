import axios from "axios";
import { env } from "@/config/env";
import { tokenStorage } from "@/lib/storage";

const REFRESH_ENDPOINT = "/auth/admin/refresh";

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 90000,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

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

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(REFRESH_ENDPOINT)
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        const response = await refreshClient.post(REFRESH_ENDPOINT);
        const accessToken = response.data?.data?.accessToken;

        if (accessToken) {
          tokenStorage.set(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          processQueue(null, accessToken);
          isRefreshing = false;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        tokenStorage.clear();

        const cleanErr = {
          status: 401,
          message: "Your session has expired. Please sign in again.",
          originalError: refreshError,
        };
        return Promise.reject(cleanErr);
      }
    }

    const message =
      error.response?.data?.message || error.message || "Something went wrong. Please try again.";

    return Promise.reject({
      status: error.response?.status,
      message,
      details: error.response?.data?.errors,
      originalError: error,
    });
  },
);
