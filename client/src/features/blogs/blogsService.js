import { apiClient } from "@/services/apiClient";

export const blogsService = {
  async list(params = {}) {
    const response = await apiClient.get("/blogs", { params });
    return response.data.data;
  },

  async create(payload) {
    const response = await apiClient.post("/blogs", payload);
    return response.data.data;
  },

  async update(id, payload) {
    const response = await apiClient.patch(`/blogs/${id}`, payload);
    return response.data.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/blogs/${id}`);
    return response.data.data;
  },

  async getById(id) {
    const response = await apiClient.get(`/blogs/by-id/${id}`);
    return response.data.data;
  },

  async getBySlug(slug) {
    const response = await apiClient.get(`/blogs/${slug}`);
    return response.data.data;
  },

  async reorder(orders) {
    const response = await apiClient.patch("/blogs/reorder", { orders });
    return response.data.data;
  },
};
