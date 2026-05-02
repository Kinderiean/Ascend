import { Platform } from 'react-native';

function required(name: string, value: string | undefined): string {
  if (!value || value.length === 0) {
    if (__DEV__) console.warn(`[env] Missing required ${name}`);
    return '';
  }
  return value;
}

export const ENV = {
  SUPABASE_URL: required('EXPO_PUBLIC_SUPABASE_URL', process.env.EXPO_PUBLIC_SUPABASE_URL),
  SUPABASE_ANON_KEY: required('EXPO_PUBLIC_SUPABASE_ANON_KEY', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY),

  REVENUECAT_KEY: Platform.select({
    ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
    android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY,
    default: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY,
  }) || '',

  SENTRY_DSN: Platform.select({
    ios: process.env.EXPO_PUBLIC_SENTRY_DSN_IOS,
    android: process.env.EXPO_PUBLIC_SENTRY_DSN_ANDROID,
    default: process.env.EXPO_PUBLIC_SENTRY_DSN_IOS,
  }) || '',

  PRIVACY_URL: process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || 'https://kinderiean.github.io/Ascend/privacy',
  TERMS_URL: process.env.EXPO_PUBLIC_TERMS_URL || 'https://kinderiean.github.io/Ascend/terms',
  EULA_URL: process.env.EXPO_PUBLIC_EULA_URL || 'https://kinderiean.github.io/Ascend/eula',

  ADMIN_EMAILS: ['ashutoshjr@gmail.com', 'kinderieangaming@gmail.com'] as const,
} as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ENV.ADMIN_EMAILS.includes(email.toLowerCase().trim() as typeof ENV.ADMIN_EMAILS[number]);
}
