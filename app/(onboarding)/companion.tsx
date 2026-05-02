import React from 'react';
import { FlatList, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore, CompanionKind } from '../../lib/store';
import { Spacing } from '../../theme/tokens';
import OnboardingShell from '../../components/OnboardingShell';
import CompanionTile from '../../components/CompanionTile';

const COMPANIONS: CompanionKind[] = [
  'cat', 'dog', 'lion', 'tiger', 'horse',
  'unicorn', 'parrot', 'elephant', 'owl', 'fox',
];

export default function CompanionScreen() {
  const router = useRouter();
  const { companion, setCompanion, completeOnboarding } = useStore();

  const handleFinish = () => {
    completeOnboarding();
    router.replace('/(tabs)/home');
  };

  // Render pairs as rows
  const pairs: CompanionKind[][] = [];
  for (let i = 0; i < COMPANIONS.length; i += 2) {
    pairs.push(COMPANIONS.slice(i, i + 2) as CompanionKind[]);
  }

  return (
    <OnboardingShell
      step={9}
      eyebrow="Step 09"
      title="Choose your buddy."
      sub="They live in the app, cheer you on, and give nudges. You can rename them after."
      onNext={handleFinish}
      nextLabel="Let's go"
      scrollable={false}
    >
      <FlatList
        data={pairs}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item: pair }) => (
          <View style={{ flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm }}>
            {pair.map(kind => (
              <View key={kind} style={{ flex: 1 }}>
                <CompanionTile
                  kind={kind}
                  selected={companion === kind}
                  onSelect={setCompanion}
                />
              </View>
            ))}
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Spacing.base }}
      />
    </OnboardingShell>
  );
}
