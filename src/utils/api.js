// In production (Vercel): uses /api/ routes (serverless functions)
// In local dev: Vite proxies /api/ to Express server on port 3001
const API_BASE = '/api';

export const api = {
  // Transactions
  getTransactions: () => fetch(`${API_BASE}/transactions`).then(r => r.json()),
  getSummary: () => fetch(`${API_BASE}/transactions/summary`).then(r => r.json()),
  getCashflow: () => fetch(`${API_BASE}/transactions/cashflow`).then(r => r.json()),
  createTransaction: (data) => fetch(`${API_BASE}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  deleteTransaction: (id) => fetch(`${API_BASE}/transactions/${id}`, { method: 'DELETE' }).then(r => r.json()),

  // Pockets
  getPockets: () => fetch(`${API_BASE}/pockets`).then(r => r.json()),
  getPocketDetail: (id) => fetch(`${API_BASE}/pockets/${id}`).then(r => r.json()),
  createPocket: (data) => fetch(`${API_BASE}/pockets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  addSavings: (id, data) => fetch(`${API_BASE}/pockets/${id}/savings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(r => r.json()),
  deletePocket: (id) => fetch(`${API_BASE}/pockets/${id}`, { method: 'DELETE' }).then(r => r.json()),
};
