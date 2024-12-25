import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const getGoogleApiKey = async () => {
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
};