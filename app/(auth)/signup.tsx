import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useColors } from '../../lib/theme';
import { Fonts, FontSize, Spacing, Radii } from '../../theme/tokens';
import {
  signUpWithEmail,
  signInWithGoogle,
  signInWithApple,
  isAppleAvailable,
} from '../../lib/auth';
import { ENV } from '../../lib/env';

export default function SignUpScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  async function onSignUp() {
    setError(null);
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (!agreed) { setError('Please agree to the Terms and Privacy Policy'); return; }
    setLoading(true);
    const r = await signUpWithEmail(email, password);
    setLoading(false);
    if (!r.success) {
      setError(r.error);
      return;
    }
    setConfirmEmailSent(true);
  }

  if (confirmEmailSent) {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, padding: Spacing['2xl'], paddingTop: insets.top + Spacing['3xl'] }}>
        <Text style={{ fontFamily: Fonts.serif, fontSize: FontSize.displayLg, color: C.cardAltInk, marginBottom: Spacing.base }}>
          Check your inbox.
        </Text>
        <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyLg, color: C.mutedAlt, lineHeight: FontSize.bodyLg * 1.5 }}>
          We sent a confirmation link to{'\n'}
          <Text style={{ color: C.cardAltInk, fontFamily: Fonts.sansSemiBold }}>{email}</Text>
          {'\n\n'}
          Tap the link to verify your account, then come back here to sign in.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/(auth)/signin' as any)}
          style={{
            marginTop: Spacing.xl,
            backgroundColor: C.cardAltInk,
            borderRadius: Radii.pill,
            paddingVertical: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 14, color: C.bg, textTransform: 'uppercase', letterSpacing: 1 }}>Back to sign in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{
            paddingTop: insets.top + Spacing['3xl'],
            paddingBottom: insets.bottom + Spacing['2xl'],
            paddingHorizontal: Spacing['2xl'],
            gap: Spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={{ fontFamily: Fonts.serif, fontSize: FontSize.displayLg, color: C.cardAltInk, lineHeight: FontSize.displayLg * 1.05 }}>
            Create your account.
          </Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyLg, color: C.mutedAlt, marginBottom: Spacing.base }}>
            One account. Sync everywhere. Cancel anytime.
          </Text>

          {error && (
            <View style={{ backgroundColor: 'rgba(181,66,58,0.12)', borderColor: 'rgba(181,66,58,0.4)', borderWidth: 1, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: '#B5423A', fontFamily: Fonts.sans, fontSize: 13 }}>{error}</Text>
            </View>
          )}

          <Field label="Email" value={email} onChange={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" />
          <Field label="Password (min 10 chars)" value={password} onChange={setPassword} placeholder="••••••••••" secureTextEntry autoComplete="new-password" />
          <Field label="Confirm password" value={confirm} onChange={setConfirm} placeholder="••••••••••" secureTextEntry autoComplete="new-password" />

          <TouchableOpacity
            onPress={() => setAgreed(!agreed)}
            activeOpacity={0.8}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}
          >
            <View style={{
              width: 22, height: 22, borderRadius: 6,
              borderWidth: 1.5,
              borderColor: agreed ? C.tint : 'rgba(245,244,239,0.3)',
              backgroundColor: agreed ? C.tint : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {agreed && <Text style={{ color: C.bg, fontSize: 14, fontFamily: Fonts.sansBold }}>✓</Text>}
            </View>
            <Text style={{ flex: 1, fontFamily: Fonts.sans, fontSize: 12, color: C.mutedAlt, lineHeight: 18 }}>
              I agree to the{' '}
              <Text onPress={() => Linking.openURL(ENV.TERMS_URL)} style={{ color: C.tint, fontFamily: Fonts.sansSemiBold }}>Terms</Text>
              {' '}and{' '}
              <Text onPress={() => Linking.openURL(ENV.PRIVACY_URL)} style={{ color: C.tint, fontFamily: Fonts.sansSemiBold }}>Privacy Policy</Text>.
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onSignUp}
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
              : <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 14, color: C.bg, textTransform: 'uppercase', letterSpacing: 1 }}>Create account</Text>
            }
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginVertical: Spacing.sm }}>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(245,244,239,0.1)' }} />
            <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: C.mutedAlt, textTransform: 'uppercase', letterSpacing: 1.5 }}>OR</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(245,244,239,0.1)' }} />
          </View>

          {isAppleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={Radii.pill}
              style={{ height: 48 }}
              onPress={async () => { setLoading(true); const r = await signInWithApple(); setLoading(false); if (!r.success && r.error !== 'Cancelled') setError(r.error); }}
            />
          )}

          <TouchableOpacity
            onPress={async () => { setLoading(true); const r = await signInWithGoogle(); setLoading(false); if (!r.success && r.error !== 'Cancelled') setError(r.error); }}
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
              Sign up with Google
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: Spacing.base }}>
            <Text style={{ color: C.mutedAlt, fontFamily: Fonts.sans, fontSize: 13 }}>Have an account?</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/signin' as any)}>
              <Text style={{ color: C.tint, fontFamily: Fonts.sansSemiBold, fontSize: 13 }}>Sign in</Text>
            </TouchableOpacity>
          </View>
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
      <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 10, color: 'rgba(245,244,239,0.4)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{label}</Text>
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
