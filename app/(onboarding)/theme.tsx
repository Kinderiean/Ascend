import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { Spacing } from '../../theme/tokens';
import OnboardingShell from '../../components/OnboardingShell';
import ThemeSwatch from '../../components/ThemeSwatch';

export default function ThemeScreen() {
  const router = useRouter();
  const { theme, setTheme } = useStore();

  return (
    <OnboardingShell
      step={7}
      eyebrow="Step 07"
      title="Your interface."
      sub="You can switch later in settings."
      onNext={() => router.push('/(onboarding)/companion')}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: Spacing['2xl'] }}>
        <ThemeSwatch kind="dark" active={theme === 'dark'} onPress={() => setTheme('dark')} />
        <ThemeSwatch kind="light" active={theme === 'light'} onPress={() => setTheme('light')} />
      </View>
    </OnboardingShell>
  );
}
