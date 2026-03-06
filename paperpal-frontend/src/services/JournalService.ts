import { supabase } from '../lib/supabaseClient';

export interface JournalStyle {
  id: string;
  name: string;
  style_code: string;
  category: string;
  citation_format: string;
  reference_order: string;
  heading_rules: any;
  font_rules: any;
  sample_citation: string;
  created_at: string;
}

export const journalService = {
  // Get all journals from Supabase
  async getAllJournals(): Promise<JournalStyle[]> {
    const { data, error } = await supabase
      .from('journal_styles')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching journals:', error);
      throw error;
    }
    
    return data || [];
  },

  // Get journal by style code
  async getJournalByCode(code: string): Promise<JournalStyle | null> {
    const { data, error } = await supabase
      .from('journal_styles')
      .select('*')
      .eq('style_code', code)
      .single();
    
    if (error) {
      console.error('Error fetching journal:', error);
      return null;
    }
    
    return data;
  }
};