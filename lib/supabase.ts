import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ENV } from './env';

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
    if (__DEV__) console.warn('[supabase] Missing URL or anon key — auth will not work');
  }
  _client = createClient(ENV.SUPABASE_URL || 'http://localhost', ENV.SUPABASE_ANON_KEY || 'anon', {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return _client;
}

export const supabase = getSupabase();
