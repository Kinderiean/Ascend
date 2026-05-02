import React from 'react';
import { View, Text, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore } from '../../lib/store';
import { useColors } from '../../lib/theme';
import { Colors, Fonts, FontSize, Spacing, AspectColors } from '../../theme/tokens';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import PillButton from '../../components/PillButton';
import BarProgress from '../../components/BarProgress';
import { ASPECT_META } from '../../components/AspectCard';

export default function LevelScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const { aspects, aspectProgress, xp, addXP, levelUp } = useStore();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={C.bg === "#0D0E10" ? "light-content" : "dark-content"} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + Spacing.xl,
          paddingBottom: 120,
          paddingHorizontal: Spacing['2xl'],
          gap: Spacing.sm,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Card tone="dark" style={{ gap: Spacing.xs }}>
          <Text style={{
            fontFamily: Fonts.monoMedium,
            fontSize: FontSize.monoSm,
            color: C.mutedAlt,
            textTransform: 'uppercase',
            letterSpacing: 2,
          }}>LV 1 → LV 2</Text>
          <Text style={{
            fontFamily: Fonts.serif,
            fontSize: FontSize.displayMd,
            color: C.cardAltInk,
          }}>Prove it. Three honest answers.</Text>
          <Text style={{
            fontFamily: Fonts.sans,
            fontSize: FontSize.bodyMd,
            color: C.mutedAlt,
            lineHeight: FontSize.bodyMd * 1.6,
          }}>Level tests check whether the routine actually happened — not just whether you opened the app. Answer truthfully. You can't level up by lying to yourself.</Text>
        </Card>

        {/* Stats row */}
        <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
          {[
            { label: 'Max reward', value: '+60 XP' },
            { label: 'Questions', value: '3' },
            { label: 'Time', value: '2 min' },
          ].map(stat => (
            <Card key={stat.label} tone="cream" style={{ flex: 1, alignItems: 'center', gap: 4, padding: Spacing.base }}>
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyLg, color: C.cardInk }}>{stat.value}</Text>
              <Text style={{ fontFamily: Fonts.monoMedium, fontSize: FontSize.monoSm, color: C.muted, textTransform: 'uppercase', letterSpacing: 1 }}>{stat.label}</Text>
            </Card>
          ))}
        </View>

        {/* Level tests per aspect */}
        {aspects.length === 0 && (
          <Card tone="dark">
            <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt }}>
              Pick aspects first to unlock level tests.
            </Text>
          </Card>
        )}

        {aspects.map((id: string) => {
          const prog = aspectProgress[id] || { level: 1, xp: 0, completedRoutines: [] };
          const meta = ASPECT_META[id as keyof typeof ASPECT_META];
          const color = AspectColors[id as keyof typeof AspectColors];
          const readyToTest = prog.xp >= 400;

          return (
            <Card key={id} tone="cream" style={{ gap: Spacing.base }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: color }} />
                <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyLg, color: C.cardInk, flex: 1 }}>{meta.name}</Text>
                <Chip label={`LV ${prog.level}`} variant="dark" size="sm" />
              </View>
              <BarProgress value={prog.xp} total={500} accent={color} />
              <Text style={{
                fontFamily: Fonts.monoMedium,
                fontSize: FontSize.monoSm,
                color: C.muted,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}>Ready?</Text>
              <Text style={{
                fontFamily: Fonts.sans,
                fontSize: FontSize.bodyMd,
                color: C.cardInk,
              }}>Take the LV {prog.level + 1} challenge.</Text>
              <PillButton
                label={readyToTest ? `Take LV ${prog.level + 1} test` : 'Keep going'}
                onPress={() => { if (readyToTest) { addXP(60); levelUp(id); } }}
                tone={readyToTest ? 'dark' : 'ghostDark'}
                disabled={!readyToTest}
              />
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}
