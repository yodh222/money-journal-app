import { apiClient } from '@/lib/apiClient';

export const transactionService = {
  async createTransaction(payload: {
    wallet_id: string;
    category_id: string | null;
    amount: number;
    notes?: string;
    tags?: string[];
    metadata?: any;
  }) {
    return await apiClient.post('/api/transactions', payload);
  }
};
