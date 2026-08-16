import { supabase } from '@/lib/supabaseClient';

export const apiClient = {
  async fetchWithAuth(url: string, options: RequestInit = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('Not authenticated');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      if (response.status === 401) {
        // If unauthorized, clear session and redirect to login
        await supabase.auth.signOut();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.error || `API Error: ${response.status}`);
    }

    return response.json();
  },

  async get(url: string) {
    return this.fetchWithAuth(url, { method: 'GET' });
  },

  async post(url: string, body: any) {
    return this.fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async put(url: string, body: any) {
    return this.fetchWithAuth(url, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(url: string) {
    return this.fetchWithAuth(url, {
      method: 'DELETE',
    });
  }
};
