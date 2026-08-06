import { apiClient } from "@/services/apiClient";

export const faqsService = {
  async list(params = {}) {
    const response = await apiClient.get("/faqs", { params });
    return response.data.data;
  },

  async create(payload) {
    const response = await apiClient.post("/faqs", payload);
    return response.data.data;
  },

  async update(id, payload) {
    const response = await apiClient.patch(`/faqs/${id}`, payload);
    return response.data.data;
  },

  async remove(id) {
    const response = await apiClient.delete(`/faqs/${id}`);
    return response.data.data;
  },

  async reorder(orders) {
    const response = await apiClient.patch("/faqs/reorder", { orders });
    return response.data.data;
  },
};
