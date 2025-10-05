// src/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = "https://kgpghqsbomdlwtuitefs.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtncGdocXNib21kbHd0dWl0ZWZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNzgyMTcsImV4cCI6MjA3Mzc1NDIxN30.L6VnrpdZX1rCjoyXo7b0X1uENYfNMh_dT542sRn9irE";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,       // ✅ use AsyncStorage on mobile
    autoRefreshToken: true,      // refresh tokens automatically
    persistSession: true,        // persist login across app restarts
    detectSessionInUrl: false,   // no URL on React Native
  },
});
