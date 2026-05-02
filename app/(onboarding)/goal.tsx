import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useStore } from '../../lib/store';
import { Colors, Fonts, FontSize, Spacing, Radii } from '../../theme/tokens';
import OnboardingShell from '../../components/OnboardingShell';
import Segmented from '../../components/Segmented';
import PillButton from '../../components/PillButton';

export default function GoalScreen() {
  const router = useRouter();
  const { goalMode, goalText, goalPhoto, setGoalMode, setGoalText, setGoalPhoto } = useStore();

  const handleUpload = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    if (!result.canceled) setGoalPhoto(result.assets[0].uri);
  };

  return (
    <OnboardingShell
      step={5}
      eyebrow="Step 05"
      title="Where are you going?"
      sub="A reference so routines have direction."
      onNext={() => router.push('/(onboarding)/aspects')}
    >
      <View style={{ gap: Spacing.base }}>
        <Segmented
          options={['Describe', 'Upload photo']}
          value={goalMode === 'describe' ? 'Describe' : 'Upload photo'}
          onChange={v => setGoalMode(v === 'Describe' ? 'describe' : 'photo')}
          tone="dark"
        />

        {goalMode === 'describe' ? (
          <View>
            <Text style={{
              fontFamily: Fonts.sansSemiBold,
              fontSize: FontSize.label,
              textTransform: 'uppercase',
              letterSpacing: 1,
              color: 'rgba(245,244,239,0.5)',
              marginBottom: Spacing.xs,
            }}>Your goal, in your words</Text>
            <TextInput
              value={goalText}
              onChangeText={setGoalText}
              placeholder="e.g. Leaner, clearer skin, more confident speaker, sleep by 11pm."
              placeholderTextColor="rgba(245,244,239,0.3)"
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.bodyLg,
                color: Colors.cardAltInk,
                backgroundColor: Colors.cardAlt,
                borderRadius: Radii.input,
                padding: Spacing.base,
                minHeight: 120,
                lineHeight: FontSize.bodyLg * 1.6,
              }}
            />
          </View>
        ) : (
          <View style={{ gap: Spacing.sm }}>
            <PillButton
              label="Upload reference photo"
              onPress={handleUpload}
              tone="ghost"
              fullWidth
            />
            {goalPhoto ? (
              <Text style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.bodyMd,
                color: Colors.ok,
                textAlign: 'center',
              }}>✓ Photo added</Text>
            ) : null}
          </View>
        )}
      </View>
    </OnboardingShell>
  );
}
