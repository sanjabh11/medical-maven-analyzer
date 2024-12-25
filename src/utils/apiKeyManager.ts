import { supabase } from "@/integrations/supabase/client";

export const getGoogleApiKey = async () => {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'GOOGLE_API_KEY')
      .single();

    if (error) {
      console.error('Error fetching API key:', error);
      return localStorage.getItem('GOOGLE_API_KEY'); // Fallback to localStorage
    }

    if (!data) {
      console.warn('No API key found in database, falling back to localStorage');
      return localStorage.getItem('GOOGLE_API_KEY');
    }

    return data.value;
  } catch (error) {
    console.error('Failed to fetch Google API key:', error);
    return localStorage.getItem('GOOGLE_API_KEY'); // Fallback to localStorage
  }
};