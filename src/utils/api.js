import { supabase } from '../lib/supabase';

async function fetchWithAuth(url, options = {}) {
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
    const error = await response.json();
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

export const api = {
  // Transactions
  async createTransaction(data) {
    return fetchWithAuth('/api/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getTransactions() {
    return fetchWithAuth('/api/transactions');
  },

  async deleteTransaction(id) {
    return fetchWithAuth(`/api/transactions/${id}`, {
      method: 'DELETE',
    });
  },

  async getSummary() {
    return fetchWithAuth('/api/transactions/summary');
  },

  // Pockets
  async getPockets() {
    return fetchWithAuth('/api/pockets');
  },

  async createPocket(data) {
    return fetchWithAuth('/api/pockets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getPocketDetail(id) {
    return fetchWithAuth(`/api/pockets/${id}`);
  },

  async deletePocket(id) {
    return fetchWithAuth(`/api/pockets/${id}`, {
      method: 'DELETE',
    });
  },

  async addPocketSaving(id, data) {
    return fetchWithAuth(`/api/pockets/${id}/savings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

