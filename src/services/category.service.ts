import { apiClient } from '@/lib/apiClient';

export const categoryService = {
  async createCategory(payload: { name: string; type: string; budget_limit: number; icon?: string; color?: string }) {
    return apiClient.post('/api/categories', payload);
  },

  async updateCategory(id: string, payload: { name: string; type: string; budget_limit?: number; icon?: string; color?: string }) {
    return apiClient.put(`/api/categories/${id}`, payload);
  },

  async deleteCategory(id: string) {
    return apiClient.delete(`/api/categories/${id}`);
  }
};
