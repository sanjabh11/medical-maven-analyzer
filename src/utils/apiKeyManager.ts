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

    return data?.value || localStorage.getItem('GOOGLE_API_KEY'); // Return Supabase value or fallback to localStorage
  } catch (error) {
    console.error('Failed to fetch Google API key:', error);
    return localStorage.getItem('GOOGLE_API_KEY'); // Fallback to localStorage
  }
};