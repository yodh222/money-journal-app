import { apiClient } from '@/lib/apiClient';

export const walletService = {
  async createWallet(payload: { name: string; type: string; balance: number }) {
    return apiClient.post('/api/wallets', payload);
  },

  async updateWallet(id: string, payload: { name: string; type: string; balance: number }) {
    return apiClient.put(`/api/wallets/${id}`, payload);
  },

  async deleteWallet(id: string) {
    return apiClient.delete(`/api/wallets/${id}`);
  }
};
