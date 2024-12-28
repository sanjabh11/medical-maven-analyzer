import { supabase } from "@/integrations/supabase/client";

export const getDeepSeekApiKey = async () => {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'DEEPSEEK3_API_KEY')
      .maybeSingle();

    if (error) {
      console.error('Error fetching DeepSeek API key:', error);
      return localStorage.getItem('DEEPSEEK3_API_KEY'); // Fallback to localStorage
    }

    if (!data) {
      console.warn('No DeepSeek API key found in database, falling back to localStorage');
      return localStorage.getItem('DEEPSEEK3_API_KEY');
    }

    return data.value;
  } catch (error) {
    console.error('Failed to fetch DeepSeek API key:', error);
    return localStorage.getItem('DEEPSEEK3_API_KEY'); // Fallback to localStorage
  }
};
