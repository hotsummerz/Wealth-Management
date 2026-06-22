import { supabase } from '../../lib/supabase.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    // GET all transactions
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }

    // POST new transaction
    if (method === 'POST') {
      const { type, amount, category, note } = req.body;
      if (!type || !amount || !category) {
        return res.status(400).json({ success: false, message: 'type, amount, and category are required' });
      }

      const { data, error } = await supabase
        .from('transactions')
        .insert({ type, amount: parseFloat(amount), category, note: note || '' })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json({ success: true, data });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
