import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uxwwwucbhwvsggqtjqyz.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4d3d3dWNiaHd2c2dncXRqcXl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3NTY4NTAsImV4cCI6MjEwMzMzMjg1MH0.9xsCvinqDvWT8hYLwurgOfc4G5GLjYG9K_xQLjK_Sj0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
