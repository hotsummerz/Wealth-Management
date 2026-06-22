import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  const { method, query } = req;
  const { id } = query;

  if (!id) {
    return res.status(400).json({ success: false, message: 'Pocket id is required' });
  }

  try {
    // GET single pocket with savings history
    if (method === 'GET') {
      const { data: pocket, error: pocketErr } = await supabase
        .from('pockets')
        .select('*')
        .eq('id', id)
        .single();

      if (pocketErr || !pocket) {
        return res.status(404).json({ success: false, message: 'Pocket not found' });
      }

      const { data: savings, error: savingsErr } = await supabase
        .from('pocket_savings')
        .select('*')
        .eq('pocket_id', id)
        .order('created_at', { ascending: false });

      if (savingsErr) throw savingsErr;

      return res.status(200).json({
        success: true,
        data: { ...pocket, savings: savings || [] }
      });
    }

    // DELETE pocket
    if (method === 'DELETE') {
      const { error } = await supabase.from('pockets').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true, message: 'Pocket deleted' });
    }

    res.setHeader('Allow', ['GET', 'DELETE']);
    return res.status(405).json({ success: false, message: `Method ${method} not allowed` });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
