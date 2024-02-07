import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from '@clerk/clerk-expo';

// Supabase url and anonymous key
const supabaseUrl ="https://icpujtrkzstykzmcsutm.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljcHVqdHJrenN0eWt6bWNzdXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU5NTkzMzIsImV4cCI6MjAyMTUzNTMzMn0.q71P3ARivrOCTE1JjYees9yMcLlt4zbPrBNJRyutt8w";

// Create a new supabase client with jwt token from clerk (async function)
export default function supabaseClient(supabaseAccessToken: string) {  
    return createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${supabaseAccessToken}` } },
        });
}
