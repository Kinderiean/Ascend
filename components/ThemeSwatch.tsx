import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Colors, Radii, Fonts, FontSize } from '../theme/tokens';

interface ThemeSwatchProps {
  kind: 'dark' | 'light';
  active: boolean;
  onPress: () => void;
}

export default function ThemeSwatch({ kind, active, onPress }: ThemeSwatchProps) {
  const isDark = kind === 'dark';
  const phoneBg = isDark ? '#0D0E10' : '#EFEAE0';
  const cardBg1 = isDark ? '#F5F4EF' : '#FFFFFF';
  const cardBg2 = isDark ? '#141517' : '#111615';
  const label = isDark ? 'Dark' : 'Light';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={{
        alignItems: 'center',
        gap: 12,
      }}
    >
      {/* Mini phone preview */}
      <View style={{
        width: 100,
        height: 160,
        borderRadius: 16,
        backgroundColor: phoneBg,
        padding: 8,
        gap: 6,
        borderWidth: active ? 2 : 1.5,
        borderColor: active ? Colors.accent : 'rgba(245,244,239,0.2)',
      }}>
        {/* Card stack preview */}
        <View style={{ height: 48, borderRadius: 12, backgroundColor: cardBg1 }} />
        <View style={{ height: 36, borderRadius: 12, backgroundColor: cardBg2 }} />
        <View style={{ height: 28, borderRadius: 12, backgroundColor: cardBg1, opacity: 0.7 }} />
      </View>

      {/* Label */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{
          width: 18, height: 18, borderRadius: 9,
          backgroundColor: active ? Colors.accent : 'transparent',
          borderWidth: active ? 0 : 1.5,
          borderColor: 'rgba(245,244,239,0.4)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {active && <Text style={{ fontSize: 10, color: Colors.accentInk }}>✓</Text>}
        </View>
        <Text style={{
          fontFamily: Fonts.sansSemiBold,
          fontSize: FontSize.bodyMd,
          color: active ? Colors.cardAltInk : 'rgba(245,244,239,0.6)',
        }}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}
