import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  const { method } = req;

  // DELETE transaction by id (via query param)
  if (method === 'DELETE') {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ success: false, message: 'id is required' });
    }
    try {
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Transaction deleted' });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET summary (total income, expense, balance)
  if (method === 'GET' && req.query.type === 'summary') {
    try {
      const { data: incomeData, error: incErr } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'income');
      if (incErr) throw incErr;

      const { data: expenseData, error: expErr } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'expense');
      if (expErr) throw expErr;

      const totalIncome = (incomeData || []).reduce((sum, r) => sum + Number(r.amount), 0);
      const totalExpense = (expenseData || []).reduce((sum, r) => sum + Number(r.amount), 0);

      return res.status(200).json({
        success: true,
        data: {
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        }
      });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  // GET all transactions (fallback)
  if (method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    } catch (err) {
      return res.status(500).json({ success: false, message: err.message });
    }
  }

  return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
}
