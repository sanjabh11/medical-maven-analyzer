import { createClient } from '@supabase/supabase-js';

// Check if environment variables are defined
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL and Anon Key must be defined');
}

const supabase = createClient(
  supabaseUrl || '',  // Provide empty string as fallback to prevent runtime error
  supabaseKey || ''   // Provide empty string as fallback to prevent runtime error
);

export const getGoogleApiKey = async () => {
  try {
    const { data, error } = await supabase
      .from('secrets')
      .select('value')
      .eq('name', 'GOOGLE_API_KEY')
      .single();

    if (error) {
      console.error('Error fetching API key:', error);
      return null;
    }

    return data?.value || null;
  } catch (error) {
    console.error('Failed to fetch Google API key:', error);
    return null;
  }
};