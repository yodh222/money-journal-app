import { apiClient } from '@/lib/apiClient';

export const categoryService = {
  async createCategory(payload: {
    name: string;
    type: string;
    budget_limit: number;
  }) {
    return await apiClient.post('/api/categories', payload);
  }
};
