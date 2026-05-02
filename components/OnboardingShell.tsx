import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StatusBar,
  KeyboardAvoidingView, Platform, SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Fonts, FontSize, Spacing } from '../theme/tokens';
import StepDots from './StepDots';
import PillButton from './PillButton';

interface OnboardingShellProps {
  step: number;
  eyebrow?: string;
  title: string;
  sub?: string;
  children: React.ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  showBack?: boolean;
  scrollable?: boolean;
}

const TOTAL_STEPS = 9;

export default function OnboardingShell({
  step, eyebrow, title, sub, children,
  onNext, nextLabel = 'Continue', nextDisabled, showBack = true, scrollable = true,
}: OnboardingShellProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const Header = (
    <>
      {/* Top bar */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing['2xl'],
      }}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            style={{ width: 32, height: 32, alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{
              fontFamily: Fonts.sansSemiBold,
              fontSize: 22,
              color: 'rgba(245,244,239,0.7)',
              lineHeight: 26,
            }}>‹</Text>
          </TouchableOpacity>
        ) : <View style={{ width: 32 }} />}

        <StepDots total={TOTAL_STEPS} current={step} tone="dark" />
        <View style={{ width: 32 }} />
      </View>

      {/* Eyebrow */}
      {eyebrow ? (
        <Text style={{
          fontFamily: Fonts.monoMedium,
          fontSize: FontSize.monoSm,
          color: 'rgba(245,244,239,0.45)',
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginBottom: Spacing.sm,
        }}>{eyebrow}</Text>
      ) : null}

      {/* Title */}
      <Text style={{
        fontFamily: Fonts.serif,
        fontSize: FontSize.displayLg,
        color: Colors.cardAltInk,
        lineHeight: FontSize.displayLg * 1.1,
        marginBottom: sub ? Spacing.base : Spacing.xl,
      }}>{title}</Text>

      {/* Sub */}
      {sub ? (
        <Text style={{
          fontFamily: Fonts.sans,
          fontSize: FontSize.bodyMd,
          color: 'rgba(245,244,239,0.6)',
          lineHeight: FontSize.bodyMd * 1.65,
          marginBottom: Spacing.xl,
        }}>{sub}</Text>
      ) : null}
    </>
  );

  const Footer = (
    <PillButton
      label={nextLabel}
      onPress={onNext}
      tone="accent"
      fullWidth
      size="lg"
      disabled={nextDisabled}
      style={{ marginTop: Spacing.xl }}
    />
  );

  const paddingTop = insets.top + Spacing.base;
  const paddingBottom = insets.bottom + Spacing.xl;
  const px = Spacing['2xl'];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: Colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />

      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingTop,
            paddingBottom,
            paddingHorizontal: px,
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {Header}
          <View style={{ flex: 1 }}>{children}</View>
          {Footer}
        </ScrollView>
      ) : (
        <View style={{
          flex: 1,
          paddingTop,
          paddingBottom,
          paddingHorizontal: px,
        }}>
          {Header}
          <View style={{ flex: 1, overflow: 'hidden' }}>{children}</View>
          {Footer}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
