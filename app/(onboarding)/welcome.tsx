import React from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize, Spacing } from '../../theme/tokens';
import PillButton from '../../components/PillButton';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top + Spacing['3xl'],
          paddingBottom: insets.bottom + Spacing['3xl'],
          paddingHorizontal: Spacing['2xl'],
          justifyContent: 'space-between',
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <Text style={{
          fontFamily: Fonts.sansBold,
          fontSize: FontSize.label,
          letterSpacing: 0.04 * FontSize.label * 4,
          textTransform: 'uppercase',
          color: 'rgba(245,244,239,0.5)',
          marginBottom: Spacing['3xl'],
        }}>ASCEND®</Text>

        {/* Main title — editorial split */}
        <View style={{ flex: 1, justifyContent: 'center', gap: 4 }}>
          <Text style={{
            fontFamily: Fonts.serif,
            fontSize: FontSize.displayXl,
            color: Colors.cardAltInk,
            lineHeight: FontSize.displayXl * 1.05,
          }}>Level up</Text>
          <Text style={{
            fontFamily: Fonts.serifItalic,
            fontSize: FontSize.displayXl,
            color: Colors.accent,
            lineHeight: FontSize.displayXl * 1.05,
          }}>every part</Text>
          <Text style={{
            fontFamily: Fonts.serif,
            fontSize: FontSize.displayXl,
            color: Colors.cardAltInk,
            lineHeight: FontSize.displayXl * 1.05,
          }}>of your life.</Text>

          {/* Body */}
          <Text style={{
            fontFamily: Fonts.sans,
            fontSize: FontSize.bodyLg,
            color: 'rgba(245,244,239,0.65)',
            lineHeight: FontSize.bodyLg * 1.6,
            marginTop: Spacing.xl,
            maxWidth: 300,
          }}>
            Ascend runs deep research on the areas you pick — looks, mind, body, craft — and builds a personal routine. You level up by proving it in real life.
          </Text>
        </View>

        {/* Bottom CTA */}
        <View style={{ gap: Spacing.base }}>
          <PillButton
            label="Begin setup"
            onPress={() => router.push('/(onboarding)/name')}
            tone="accent"
            fullWidth
            size="lg"
          />
          <Text style={{
            fontFamily: Fonts.sans,
            fontSize: FontSize.bodyMd,
            color: 'rgba(245,244,239,0.4)',
            textAlign: 'center',
          }}>~3 minutes · your data stays on device</Text>
        </View>
      </ScrollView>
    </View>
  );
}
