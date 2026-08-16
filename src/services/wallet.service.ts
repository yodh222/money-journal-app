import { apiClient } from '@/lib/apiClient';

export const walletService = {
  async createWallet(payload: {
    name: string;
    type: string;
    balance: number;
  }) {
    return await apiClient.post('/api/wallets', payload);
  }
};
