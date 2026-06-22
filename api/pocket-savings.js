import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!id) {
    return res.status(400).json({ success: false, message: 'Pocket id is required' });
  }

  if (method !== 'POST') {
    return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  }

  try {
    const { amount, note } = req.body;

    // Get current pocket
    const { data: pocket, error: pocketErr } = await supabase
      .from('pockets')
      .select('*')
      .eq('id', id)
      .single();

    if (pocketErr || !pocket) {
      return res.status(404).json({ success: false, message: 'Pocket not found' });
    }

    // Check balance for withdrawals
    const newAmount = Number(pocket.current_amount) + Number(amount);
    if (newAmount < 0) {
      return res.status(400).json({ success: false, message: 'Insufficient balance in pocket' });
    }

    // Insert savings record
    const { error: savingsErr } = await supabase
      .from('pocket_savings')
      .insert({ pocket_id: Number(id), amount: parseFloat(amount), note: note || '' });

    if (savingsErr) throw savingsErr;

    // Update pocket current_amount
    const { data: updated, error: updateErr } = await supabase
      .from('pockets')
      .update({ current_amount: newAmount })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    return res.status(200).json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
