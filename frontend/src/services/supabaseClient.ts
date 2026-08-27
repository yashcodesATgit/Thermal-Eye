import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uxwwwucbhwvsggqtjqyz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d3d3dWNiaHd2c2dncXRqcXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTQ5ODUsImV4cCI6MjA1NTkzMDk4NX0.dummy_anon_key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
