import { apiClient } from "@/services/apiClient";

export const contactsService = {
  async list(params = {}) {
    const response = await apiClient.get("/contacts", { params });
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/contacts/${id}`);
    return response.data.data;
  },

  async updateStatus(id, status) {
    const response = await apiClient.patch(`/contacts/${id}/status`, { status });
    return response.data.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/contacts/${id}`);
    return response.data.data;
  },

  async create(payload) {
    const response = await apiClient.post("/contacts", payload);
    return response.data.data;
  },
};
