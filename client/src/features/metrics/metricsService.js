import { apiClient } from "@/services/apiClient";

export const metricsService = {
  async list(params = {}) {
    const response = await apiClient.get("/metrics", { params });
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/metrics/${id}`);
    return response.data.data;
  },

  async create(payload) {
    const response = await apiClient.post("/metrics", payload);
    return response.data.data;
  },

  async update(id, payload) {
    const response = await apiClient.patch(`/metrics/${id}`, payload);
    return response.data.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/metrics/${id}`);
    return response.data.data;
  },
};
