import { apiClient } from "@/services/apiClient";

export const servicesService = {
  async list(params = {}) {
    const response = await apiClient.get("/services", { params });
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/services/${id}`);
    return response.data.data;
  },

  async create(payload) {
    const response = await apiClient.post("/services", payload);
    return response.data.data;
  },

  async update(id, payload) {
    const response = await apiClient.patch(`/services/${id}`, payload);
    return response.data.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/services/${id}`);
    return response.data.data;
  },
};
