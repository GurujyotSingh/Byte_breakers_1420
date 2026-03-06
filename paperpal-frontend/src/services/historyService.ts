import { supabase } from '../lib/supabaseClient';

export const historyService = {
  async saveToHistory(data: any) {
    const { error } = await supabase
      .from('formatting_history')
      .insert([data]);
    
    if (error) console.error('Error saving history:', error);
  },

  async getHistory(sessionId: string) {
    const { data } = await supabase
      .from('formatting_history')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });
    
    return data || [];
  }
};