import { apiClient } from "@/services/apiClient";

export const usersService = {
  async list(params = {}) {
    const response = await apiClient.get("/users", { params });
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  async update(id, payload) {
    const response = await apiClient.patch(`/users/${id}`, payload);
    return response.data.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data.data;
  },
};
