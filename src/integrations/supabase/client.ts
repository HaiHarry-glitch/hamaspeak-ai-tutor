// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://oxlxqrdplupauebxqvhc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94bHhxcmRwbHVwYXVlYnhxdmhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwNDgwMjQsImV4cCI6MjA2MDYyNDAyNH0.nUH8YWUooy6tv9R5wzQx1cabBtNhqmNstXjLRobKwt8";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);