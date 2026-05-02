import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '../../lib/theme';
import { Fonts, FontSize, Spacing, Radii } from '../../theme/tokens';
import { sendPasswordReset } from '../../lib/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function onSend() {
    setError(null);
    setLoading(true);
    const r = await sendPasswordReset(email);
    setLoading(false);
    if (!r.success) { setError(r.error); return; }
    setSent(true);
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
            Reset password.
          </Text>
          <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyLg, color: C.mutedAlt, marginBottom: Spacing.base }}>
            Enter the email tied to your account. We'll send a reset link.
          </Text>

          {error && (
            <View style={{ backgroundColor: 'rgba(181,66,58,0.12)', borderColor: 'rgba(181,66,58,0.4)', borderWidth: 1, borderRadius: 12, padding: 12 }}>
              <Text style={{ color: '#B5423A', fontFamily: Fonts.sans, fontSize: 13 }}>{error}</Text>
            </View>
          )}

          {sent ? (
            <View style={{ backgroundColor: 'rgba(76,187,115,0.12)', borderColor: 'rgba(76,187,115,0.4)', borderWidth: 1, borderRadius: 12, padding: 14 }}>
              <Text style={{ color: '#4CBB73', fontFamily: Fonts.sansSemiBold, fontSize: 13 }}>
                Check your inbox.
              </Text>
              <Text style={{ color: C.mutedAlt, fontFamily: Fonts.sans, fontSize: 12, marginTop: 4 }}>
                We sent a reset link to {email}. Click it to set a new password.
              </Text>
            </View>
          ) : (
            <>
              <View style={{ gap: 6 }}>
                <Text style={{ fontFamily: Fonts.monoMedium, fontSize: 10, color: 'rgba(245,244,239,0.4)', textTransform: 'uppercase', letterSpacing: 1.5 }}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(245,244,239,0.25)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
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

              <TouchableOpacity
                onPress={onSend}
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
                  : <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 14, color: C.bg, textTransform: 'uppercase', letterSpacing: 1 }}>Send reset link</Text>
                }
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity onPress={() => router.replace('/(auth)/signin' as any)} style={{ alignItems: 'center', marginTop: Spacing.base }}>
            <Text style={{ color: C.tint, fontFamily: Fonts.sansSemiBold, fontSize: 13 }}>Back to sign in</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
