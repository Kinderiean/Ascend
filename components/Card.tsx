import React from 'react';
import { View, ViewStyle } from 'react-native';
import { Colors, Radii, Spacing } from '../theme/tokens';

type Tone = 'cream' | 'dark' | 'hero' | 'custom';

interface CardProps {
  tone?: Tone;
  children: React.ReactNode;
  style?: ViewStyle;
  noPad?: boolean;
}

export default function Card({ tone = 'cream', children, style, noPad }: CardProps) {
  const isDark = tone === 'dark';
  const isHero = tone === 'hero';

  const bg = isDark ? Colors.cardAlt : Colors.card;
  const radius = isHero ? Radii.hero : Radii.card;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: radius,
          padding: noPad ? 0 : Spacing.xl,
          overflow: 'hidden',
          borderWidth: isDark ? 1 : 0,
          borderColor: isDark ? Colors.line : undefined,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
