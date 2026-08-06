import { apiClient } from "@/services/apiClient";

export const projectsService = {
  async list(params = {}) {
    const response = await apiClient.get("/projects", { params });
    return response.data.data;
  },

  async create(payload) {
    const response = await apiClient.post("/projects", payload);
    return response.data.data;
  },

  async update(id, payload) {
    const response = await apiClient.patch(`/projects/${id}`, payload);
    return response.data.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/projects/by-id/${id}`);
    return response.data.data;
  },

  async getBySlug(slug) {
    const response = await apiClient.get(`/projects/${slug}`);
    return response.data.data;
  },

  async reorder(orders) {
    const response = await apiClient.patch("/projects/reorder", { orders });
    return response.data.data;
  },
};
