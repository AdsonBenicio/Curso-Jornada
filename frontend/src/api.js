const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

const mockTransactions = [
  { id: 1098, account_id: 'ACC-100', destination_account_id: 'ACC-NEW', amount: 25000, currency: 'BRL', occurred_at: '2026-07-22T02:30:00Z', destination_account_created_at: '2026-07-20T02:30:00Z', status: 'suspicious', created_at: '2026-07-22T02:30:12Z', triggered_rules: ['high_amount', 'new_destination_account', 'unusual_hour'] },
  { id: 1097, account_id: 'ACC-302', destination_account_id: 'ACC-811', amount: 7800, currency: 'BRL', occurred_at: '2026-07-22T01:54:00Z', destination_account_created_at: null, status: 'suspicious', created_at: '2026-07-22T01:54:14Z', triggered_rules: ['unusual_hour'] },
  { id: 1096, account_id: 'ACC-218', destination_account_id: 'ACC-444', amount: 4280, currency: 'BRL', occurred_at: '2026-07-21T18:41:00Z', destination_account_created_at: null, status: 'approved', created_at: '2026-07-21T18:41:09Z', triggered_rules: [] },
  { id: 1095, account_id: 'ACC-100', destination_account_id: 'ACC-200', amount: 12500, currency: 'BRL', occurred_at: '2026-07-21T16:22:00Z', destination_account_created_at: null, status: 'suspicious', created_at: '2026-07-21T16:22:09Z', triggered_rules: ['high_amount'] },
  { id: 1094, account_id: 'ACC-721', destination_account_id: 'ACC-400', amount: 965, currency: 'BRL', occurred_at: '2026-07-21T14:08:00Z', destination_account_created_at: null, status: 'approved', created_at: '2026-07-21T14:08:09Z', triggered_rules: [] },
  { id: 1093, account_id: 'ACC-404', destination_account_id: 'ACC-551', amount: 650, currency: 'BRL', occurred_at: '2026-07-21T12:34:00Z', destination_account_created_at: null, status: 'approved', created_at: '2026-07-21T12:34:09Z', triggered_rules: [] },
  { id: 1092, account_id: 'ACC-302', destination_account_id: 'ACC-811', amount: 7800, currency: 'BRL', occurred_at: '2026-07-21T01:48:00Z', destination_account_created_at: null, status: 'suspicious', created_at: '2026-07-21T01:48:14Z', triggered_rules: ['repeated_transaction', 'unusual_hour'] },
]

const mockRules = { suspicious_amount_limit: 10000, repeated_transaction_window_minutes: 10, new_account_age_days: 7, unusual_hour_start: 0, unusual_hour_end: 5 }

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) throw new Error(`API respondeu com status ${response.status}`)
  return response.json()
}

export async function getTransactions() {
  try { return { data: await request('/transactions'), isMock: false } } catch { return { data: mockTransactions, isMock: true } }
}

export async function createTransaction(payload) {
  try { return { data: await request('/transactions', { method: 'POST', body: JSON.stringify(payload) }), isMock: false } } catch {
    const result = { ...payload, id: Date.now(), status: payload.amount > mockRules.suspicious_amount_limit ? 'suspicious' : 'approved', created_at: new Date().toISOString(), triggered_rules: payload.amount > mockRules.suspicious_amount_limit ? ['high_amount'] : [] }
    mockTransactions.unshift(result)
    return { data: result, isMock: true }
  }
}

export async function getRules() {
  try { return { data: await request('/config/rules'), isMock: false } } catch { return { data: mockRules, isMock: true } }
}

export async function updateRules(rules) {
  try { return { data: await request('/config/rules', { method: 'PUT', body: JSON.stringify(rules) }), isMock: false } } catch { Object.assign(mockRules, rules); return { data: mockRules, isMock: true } }
}
