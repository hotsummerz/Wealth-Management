import { supabase } from '../lib/supabase.js';

export default async function handler(req, res) {
  const { method } = req;

  try {
    // GET all pockets
    if (method === 'GET') {
      const { data, error } = await supabase
        .from('pockets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }

    // POST new pocket
    if (method === 'POST') {
      const { name, target, platform, instrument, frequency, routine_amount, estimated_date } = req.body;
      if (!name || !target || !platform || !instrument || !frequency || !routine_amount) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      const { data, error } = await supabase
        .from('pockets')
        .insert({
          name,
          target: parseFloat(target),
          platform,
          instrument,
          frequency,
          routine_amount: parseFloat(routine_amount),
          estimated_date: estimated_date || null,
        })
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
