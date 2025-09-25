// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Prefer environment-provided credentials, with safe fallback to the bundled defaults
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://bdxbayuxzybtgwkromzd.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkeGJheXV4enlidGd3a3JvbXpkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg2MjczMTAsImV4cCI6MjA3NDIwMzMxMH0.dKa4bERYqZD4eJZULDsdXjhZY09fEr27pILKdOlcJM8';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    }
});
