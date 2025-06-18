import { supabase } from "@/integrations/supabase/client";

export const getGoogleApiKey = async (): Promise<string | null> => {
  try {
    // First try to get from localStorage as immediate fallback
    const localKey = localStorage.getItem('GOOGLE_API_KEY');
    
    // Try to fetch from Supabase with a timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), 3000);
    });

    const supabasePromise = supabase
      .from('secrets')
      .select('value')
      .eq('name', 'GOOGLE_API_KEY')
      .maybeSingle();

    try {
      const { data, error } = await Promise.race([supabasePromise, timeoutPromise]);

      if (error) {
        console.warn('Error fetching API key from Supabase:', error);
        return localKey || getDefaultApiKey();
      }

      if (data?.value) {
        // Store in localStorage for future use
        localStorage.setItem('GOOGLE_API_KEY', data.value);
        return data.value;
      }

      return localKey || getDefaultApiKey();
    } catch (networkError) {
      console.warn('Network error fetching API key, using fallback:', networkError);
      return localKey || getDefaultApiKey();
    }
  } catch (error) {
    console.error('Failed to fetch Google API key:', error);
    return localStorage.getItem('GOOGLE_API_KEY') || getDefaultApiKey();
  }
};

// Fallback API key for development/demo purposes
const getDefaultApiKey = (): string => {
  // In a real application, you would want to prompt the user to enter their API key
  // For demo purposes, we'll return a placeholder that indicates the key needs to be set
  return 'AIzaSyDemoKey_PleaseReplaceWithActualKey';
};

export const setGoogleApiKey = (apiKey: string): void => {
  localStorage.setItem('GOOGLE_API_KEY', apiKey);
};

export const hasValidApiKey = async (): Promise<boolean> => {
  const apiKey = await getGoogleApiKey();
  return apiKey !== null && apiKey !== 'AIzaSyDemoKey_PleaseReplaceWithActualKey' && apiKey.length > 20;
};