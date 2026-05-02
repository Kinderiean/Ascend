import React from 'react';
import { View, Text, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useStore, Aspect } from '../../lib/store';
import { Colors, Fonts, FontSize, Spacing, Radii, AspectColors } from '../../theme/tokens';
import { useColors } from '../../lib/theme';
import Card from '../../components/Card';
import Chip from '../../components/Chip';
import BarProgress from '../../components/BarProgress';
import { ASPECT_META } from '../../components/AspectCard';

const ALL_ASPECTS: Aspect[] = [
  'facial', 'physical', 'mental', 'spiritual', 'money', 'knowledge',
];

export default function AspectsScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const router = useRouter();
  const { aspects, aspectProgress } = useStore();
  const inactive = ALL_ASPECTS.filter(a => !aspects.includes(a));

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
        <Card tone="dark" style={{ gap: Spacing.xs }}>
          <Text style={{
            fontFamily: Fonts.serif,
            fontSize: FontSize.displayMd,
            color: C.cardAltInk,
          }}>Train your life map.</Text>
          <Text style={{
            fontFamily: Fonts.sans,
            fontSize: FontSize.bodyMd,
            color: C.mutedAlt,
            lineHeight: FontSize.bodyMd * 1.6,
          }}>Each aspect is its own track with quests, research briefs and level tests.</Text>
        </Card>

        {/* Active aspects */}
        {aspects.length > 0 && aspects.map((id: string) => {
          const prog = aspectProgress[id] || { level: 1, xp: 0, completedRoutines: [] };
          const meta = ASPECT_META[id as keyof typeof ASPECT_META];
          if (!meta) return null;
          const color = AspectColors[id as keyof typeof AspectColors] ?? '#C9B8F5';
          return (
            <TouchableOpacity
              key={id}
              onPress={() => router.push(`/aspect/${id}` as any)}
              activeOpacity={0.85}
            >
              <Card tone="cream" style={{ gap: Spacing.sm }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.base }}>
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: Fonts.sansBold, fontSize: FontSize.numMd * 0.6, color: C.cardInk }}>
                      {prog.level}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyLg, color: C.cardInk }}>{meta.name}</Text>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: 'rgba(13,14,16,0.55)' }}>Level {prog.level}</Text>
                  </View>
                  <Chip label={`LV ${prog.level}`} variant="dark" size="sm" />
                </View>
                <Text style={{
                  fontFamily: Fonts.monoMedium,
                  fontSize: FontSize.monoSm,
                  color: C.muted,
                  textTransform: 'uppercase',
                  letterSpacing: 1.5,
                }}>Progress to LV {prog.level + 1}</Text>
                <BarProgress value={prog.xp} total={500} accent={color} />
              </Card>
            </TouchableOpacity>
          );
        })}

        {/* Unlocked / add more */}
        {inactive.length > 0 && (
          <View style={{ gap: Spacing.sm }}>
            <Text style={{
              fontFamily: Fonts.monoMedium,
              fontSize: FontSize.monoSm,
              color: 'rgba(245,244,239,0.4)',
              textTransform: 'uppercase',
              letterSpacing: 2,
              paddingHorizontal: 2,
            }}>Add more</Text>
            {inactive.map(id => {
              const meta = ASPECT_META[id];
              const color = AspectColors[id];
              return (
                <Card key={id} tone="dark" style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.base, padding: Spacing.base, opacity: 0.65 }}>
                  <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: FontSize.bodyLg, color: C.cardAltInk }}>{meta.name}</Text>
                    <Text style={{ fontFamily: Fonts.sans, fontSize: FontSize.bodyMd, color: C.mutedAlt }}>{meta.blurb}</Text>
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
