import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { useStore } from '../../lib/store';
import { Spacing } from '../../theme/tokens';
import OnboardingShell from '../../components/OnboardingShell';
import TextField from '../../components/TextField';
import Segmented from '../../components/Segmented';

export default function MetricsScreen() {
  const router = useRouter();
  const { height, weight, age, units, setHeight, setWeight, setAge, setUnits } = useStore();

  const heightSuffix = units === 'metric' ? 'cm' : 'ft';
  const weightSuffix = units === 'metric' ? 'kg' : 'lbs';

  return (
    <OnboardingShell
      step={4}
      eyebrow="Step 04"
      title="Your numbers."
      onNext={() => router.push('/(onboarding)/goal')}
    >
      <View style={{ gap: Spacing.base }}>
        <Segmented
          options={['Metric', 'Imperial']}
          value={units === 'metric' ? 'Metric' : 'Imperial'}
          onChange={v => setUnits(v === 'Metric' ? 'metric' : 'imperial')}
          tone="dark"
          label="Units"
        />

        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Height"
              value={height}
              onChangeText={setHeight}
              placeholder="175"
              suffix={heightSuffix}
              tone="dark"
              keyboardType="decimal-pad"
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Weight"
              value={weight}
              onChangeText={setWeight}
              placeholder="70"
              suffix={weightSuffix}
              tone="dark"
              keyboardType="decimal-pad"
            />
          </View>
        </View>

        <TextField
          label="Age"
          value={age}
          onChangeText={setAge}
          placeholder="24"
          suffix="yrs"
          tone="dark"
          keyboardType="number-pad"
        />
      </View>
    </OnboardingShell>
  );
}
