import { createClient } from '@supabase/supabase-js';

// Supabase URL and anon key
const supabaseUrl = 'https://navhyxaewyzigsntkcmu.supabase.co'; // Your Supabase URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5hdmh5eGFld3l6aWdzbnRrY211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUxMzE2OTAsImV4cCI6MjA1MDcwNzY5MH0.w0EnTopULCpT_bW-JpdCdv3KCz5vhSg8x5VW9cq48l8'; // Your Supabase anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
