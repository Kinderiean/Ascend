import { useEffect, useState, useCallback } from 'react';
import { Platform, AppState } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { isAdminEmail } from './env';
import { emailSchema, passwordSchema, validate } from './validation';

WebBrowser.maybeCompleteAuthSession();

export type AuthError = { message: string };
export type AuthResult = { success: true } | { success: false; error: string };

export interface Entitlement {
  isPlus: boolean;
  isLifetime: boolean;
  source: 'admin' | 'subscription' | 'none';
}

export const FREE_ENTITLEMENT: Entitlement = { isPlus: false, isLifetime: false, source: 'none' };

AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});

export function useAuthSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      if (mounted) setSession(s);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

export function useEntitlement(): Entitlement {
  const { user } = useAuthSession();
  const [ent, setEnt] = useState<Entitlement>(FREE_ENTITLEMENT);

  useEffect(() => {
    if (!user) {
      setEnt(FREE_ENTITLEMENT);
      return;
    }
    if (isAdminEmail(user.email)) {
      setEnt({ isPlus: true, isLifetime: true, source: 'admin' });
      return;
    }
    let cancelled = false;
    supabase
      .from('profiles')
      .select('entitlement')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        const e = (data?.entitlement as string) ?? 'free';
        if (e === 'ascend_plus_lifetime') setEnt({ isPlus: true, isLifetime: true, source: 'admin' });
        else if (e === 'ascend_plus') setEnt({ isPlus: true, isLifetime: false, source: 'subscription' });
        else setEnt(FREE_ENTITLEMENT);
      });
    return () => { cancelled = true; };
  }, [user]);

  return ent;
}

export async function signUpWithEmail(email: string, password: string): Promise<AuthResult> {
  const e = validate(emailSchema, email);
  if (!e.success) return { success: false, error: e.error };
  const p = validate(passwordSchema, password);
  if (!p.success) return { success: false, error: p.error };

  const { error } = await supabase.auth.signUp({
    email: e.value,
    password: p.value,
    options: {
      emailRedirectTo: Linking.createURL('/auth-callback'),
    },
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  const e = validate(emailSchema, email);
  if (!e.success) return { success: false, error: e.error };
  if (!password || password.length < 1) return { success: false, error: 'Enter your password' };

  const { error } = await supabase.auth.signInWithPassword({
    email: e.value,
    password,
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function sendPasswordReset(email: string): Promise<AuthResult> {
  const e = validate(emailSchema, email);
  if (!e.success) return { success: false, error: e.error };
  const { error } = await supabase.auth.resetPasswordForEmail(e.value, {
    redirectTo: Linking.createURL('/auth-callback'),
  });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function signInWithApple(): Promise<AuthResult> {
  if (Platform.OS !== 'ios') {
    return { success: false, error: 'Sign in with Apple is only available on iOS in this build.' };
  }
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    if (!credential.identityToken) {
      return { success: false, error: 'Apple did not return an identity token' };
    }
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
    });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    if (err?.code === 'ERR_CANCELED' || err?.code === 'ERR_REQUEST_CANCELED') {
      return { success: false, error: 'Cancelled' };
    }
    return { success: false, error: err?.message ?? 'Apple sign-in failed' };
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  try {
    const redirectTo = Linking.createURL('/auth-callback');
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });
    if (error || !data?.url) return { success: false, error: error?.message ?? 'OAuth init failed' };

    const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (result.type !== 'success' || !result.url) {
      return { success: false, error: 'Cancelled' };
    }
    const url = new URL(result.url);
    const params = new URLSearchParams(url.hash.slice(1) || url.search.slice(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) {
      return { success: false, error: 'Missing tokens in OAuth response' };
    }
    const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
    if (setErr) return { success: false, error: setErr.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Google sign-in failed' };
  }
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function deleteAccount(): Promise<AuthResult> {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) return { success: true };

  const { error } = await supabase.rpc('request_account_deletion');
  if (error && error.code !== 'PGRST116' && error.code !== '42883') {
    return { success: false, error: error.message };
  }
  await supabase.auth.signOut();
  return { success: true };
}

export function userEmail(user: User | null): string | null {
  return user?.email?.toLowerCase().trim() ?? null;
}

export const isAppleAvailable = Platform.OS === 'ios';
