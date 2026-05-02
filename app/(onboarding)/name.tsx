import React, { useState } from 'react';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { Colors, Fonts, FontSize, Spacing } from '../../theme/tokens';
import OnboardingShell from '../../components/OnboardingShell';
import TextField from '../../components/TextField';

export default function NameScreen() {
  const router = useRouter();
  const { name, setName } = useStore();
  const [value, setValue] = useState(name);

  const handleNext = () => {
    setName(value.trim());
    router.push('/(onboarding)/looks');
  };

  return (
    <OnboardingShell
      step={1}
      eyebrow="Step 01"
      title="What should we call you?"
      nextDisabled={!value.trim()}
      onNext={handleNext}
    >
      <TextField
        label="Your name"
        value={value}
        onChangeText={setValue}
        placeholder="e.g. Bohdan"
        tone="dark"
        returnKeyType="done"
        onSubmitEditing={value.trim() ? handleNext : undefined}
        autoFocus
      />
      <Text style={{
        fontFamily: Fonts.sans,
        fontSize: FontSize.bodyMd,
        color: 'rgba(245,244,239,0.45)',
        marginTop: Spacing.sm,
      }}>Just a first name. Your buddy will use it a lot.</Text>
    </OnboardingShell>
  );
}
