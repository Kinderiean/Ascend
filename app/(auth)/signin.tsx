import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useColors } from '../../lib/theme';
import { Fonts, FontSize, Spacing, Radii } from '../../theme/tokens';
import {
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  isAppleAvailable,
} from '../../lib/auth';
import { ENV } from '../../lib/env';
import { Linking } from 'react-native';

export default function SignInScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onEmailSignIn() {
    setError(null);
    setLoading(true);
    const r = await signInWithEmail(email, password);
    setLoading(false);
    if (!r.success) setError(r.error);
  }

  async function onGoogle() {
    setError(null);
    setLoading(true);
    const r = await signInWithGoogle();
    setLoading(false);
    if (!r.success && r.error !== 'Cancelled') setError(r.error);
  }

  async function onApple() {
    setError(null);
    setLoading(true);
    const r = await signInWithApple();
    setLoading(false);
    if (!r.success && r.error !== 'Cancelled') setError(r.error);
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + Spacing['3xl'],
            paddingBottom: insets.bottom + Spacing['2xl'],
            paddingHorizontal: Spacing['2xl'],
            gap: Spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{
            fontFamily: Fonts.serif,
            fontSize: FontSize.displayLg,
            color: C.cardAltInk,
            lineHeight: FontSize.displayLg * 1.05,
          }}>
            Welcome back.
          </Text>
          <Text style={{
            fontFamily: Fonts.sans,
            fontSize: FontSize.bodyLg,
            color: C.mutedAlt,
            marginBottom: Spacing.base,
          }}>
            Sign in to sync your progress across devices.
          </Text>

          {error && (
            <View style={{
              backgroundColor: 'rgba(181,66,58,0.12)',
              borderColor: 'rgba(181,66,58,0.4)',
              borderWidth: 1,
              borderRadius: 12,
              padding: 12,
            }}>
              <Text style={{ color: '#B5423A', fontFamily: Fonts.sans, fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <Field
            label="Email"
            value={email}
            onChange={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />
          <Field
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password' as any)}>
            <Text style={{
              fontFamily: Fonts.sansSemiBold,
              fontSize: FontSize.bodyMd,
              color: C.tint,
              alignSelf: 'flex-end',
            }}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onEmailSignIn}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              backgroundColor: C.cardAltInk,
              borderRadius: Radii.pill,
              paddingVertical: 14,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? <ActivityIndicator color={C.bg} />
              : <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 14, color: C.bg, textTransform: 'uppercase', letterSpacing: 1 }}>Sign in</Text>
            }
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.sm }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(245,244,239,0.1)' }} />
            <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: C.mutedAlt, textTransform: 'uppercase', letterSpacing: 1.5 }}>OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(245,244,239,0.1)' }} />
          </View>

          {isAppleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={Radii.pill}
              style={{ height: 48 }}
              onPress={onApple}
            />
          )}

          <TouchableOpacity
            onPress={onGoogle}
            disabled={loading}
            activeOpacity={0.85}
            style={{
              borderRadius: Radii.pill,
              paddingVertical: 14,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: 'rgba(245,244,239,0.18)',
              backgroundColor: 'rgba(245,244,239,0.05)',
            }}
          >
            <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 14, color: C.cardAltInk }}>
              Continue with Google
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.base }}>
            <Text style={{ color: C.mutedAlt, fontFamily: Fonts.sans, fontSize: 13 }}>No account?</Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup' as any)}>
              <Text style={{ color: C.tint, fontFamily: Fonts.sansSemiBold, fontSize: 13 }}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => router.replace('/(onboarding)/welcome' as any)}
            style={{ alignItems: 'center', marginTop: Spacing.sm }}
          >
            <Text style={{ color: C.mutedAlt, fontFamily: Fonts.sans, fontSize: 12, textDecorationLine: 'underline' }}>
              Continue as guest
            </Text>
          </TouchableOpacity>

          <Text style={{
            fontFamily: Fonts.sans,
            fontSize: 11,
            color: C.mutedAlt,
            textAlign: 'center',
            lineHeight: 16,
            paddingHorizontal: Spacing.base,
            marginTop: Spacing.base,
          }}>
            By continuing you agree to our{' '}
            <Text onPress={() => Linking.openURL(ENV.TERMS_URL)} style={{ color: C.tint }}>Terms</Text>
            {' '}and{' '}
            <Text onPress={() => Linking.openURL(ENV.PRIVACY_URL)} style={{ color: C.tint }}>Privacy Policy</Text>.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({
  label, value, onChange, placeholder, keyboardType, autoCapitalize, autoComplete, secureTextEntry,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: 'email' | 'password' | 'new-password' | 'off';
  secureTextEntry?: boolean;
}) {
  const C = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{
        fontFamily: Fonts.monoMedium, fontSize: 10,
        color: 'rgba(245,244,239,0.4)',
        textTransform: 'uppercase', letterSpacing: 1.5,
      }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(245,244,239,0.25)"
        keyboardType={keyboardType ?? 'default'}
        autoCapitalize={autoCapitalize ?? 'sentences'}
        autoComplete={autoComplete}
        secureTextEntry={secureTextEntry}
        autoCorrect={false}
        style={{
          backgroundColor: 'rgba(245,244,239,0.06)',
          borderRadius: 12,
          paddingHorizontal: 14,
          paddingVertical: 14,
          fontFamily: Fonts.sans,
          fontSize: 15,
          color: C.cardAltInk,
          borderWidth: 1,
          borderColor: 'rgba(245,244,239,0.1)',
        }}
      />
    </View>
  );
}
