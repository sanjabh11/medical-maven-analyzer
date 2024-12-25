import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client only if URL and key are available
const initSupabase = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase configuration missing. Please ensure you have connected to Supabase in the project settings.');
    return null;
  }

  return createClient(supabaseUrl, supabaseKey);
};

export const getGoogleApiKey = async () => {
  const supabase = initSupabase();
  
  if (!supabase) {
    console.error('Unable to initialize Supabase client');
    return localStorage.getItem('GOOGLE_API_KEY'); // Fallback to localStorage if Supabase isn't configured
  }

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