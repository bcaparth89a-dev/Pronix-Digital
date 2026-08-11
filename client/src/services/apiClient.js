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
  timeout: 15000,
  withCredentials: true,
});

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

      try {
        const response = await refreshClient.post(REFRESH_ENDPOINT);
        const accessToken = response.data?.data?.accessToken;

        if (accessToken) {
          tokenStorage.set(accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
      } catch {
        tokenStorage.clear();
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
