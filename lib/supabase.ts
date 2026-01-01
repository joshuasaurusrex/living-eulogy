import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://hbsrqbphrugdghyizwcc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhic3JxYnBocnVnZGdoeWl6d2NjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyMzAzNzgsImV4cCI6MjA4MjgwNjM3OH0.EWWyrwo09lpxa6xXJicywnVvJznXGnbNJKEBGQ7Y1Nc';

// Handle SSR - only use AsyncStorage on native/client
const isServer = typeof window === 'undefined';

const storage = isServer ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: !isServer,
    persistSession: !isServer,
    detectSessionInUrl: false,
  },
});
