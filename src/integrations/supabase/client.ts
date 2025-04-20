
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oxlxqrdplupauebxqvhc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bHhxcmRwbHVwYXVlYnhxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDgwMjQsImV4cCI6MjA2MDYyNDAyNH0.nUH8YWUooy6tv9R5wzQx1cabBtNhqmNstXjLRobKwt8';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
