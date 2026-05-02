import React, { useEffect } from 'react';
import { View, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore, Aspect } from '../../lib/store';
import { Spacing } from '../../theme/tokens';
import OnboardingShell from '../../components/OnboardingShell';
import AspectCard from '../../components/AspectCard';

const ALL_ASPECTS: Aspect[] = [
  'facial', 'physical', 'mental', 'spiritual', 'money', 'knowledge',
];

export default function AspectsScreen() {
  const router = useRouter();
  const { aspects, toggleAspect } = useStore();
  const n = aspects.length;

  // Pre-select all 6 aspects by default for new users
  useEffect(() => {
    if (aspects.length === 0) {
      ALL_ASPECTS.forEach(a => toggleAspect(a));
    }
  }, []);

  return (
    <OnboardingShell
      step={6}
      eyebrow="Step 06"
      title="Your 6 arenas."
      sub={`All 6 selected by default — deselect any you don't want to track now. (${n} selected)`}
      onNext={() => router.push('/(onboarding)/theme')}
      nextDisabled={n < 1}
      scrollable={false}
    >
      <FlatList
        data={ALL_ASPECTS}
        keyExtractor={item => item}
        renderItem={({ item }) => (
          <View style={{ marginBottom: Spacing.sm }}>
            <AspectCard
              id={item}
              selected={aspects.includes(item)}
              onToggle={toggleAspect}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.base }}
      />
    </OnboardingShell>
  );
}
