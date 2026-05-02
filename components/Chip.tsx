import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { Colors, Radii, Fonts, FontSize } from '../theme/tokens';

type ChipVariant = 'accent' | 'dark' | 'default' | 'on';
type ChipSize = 'sm' | 'md';

interface ChipProps {
  label: string;
  variant?: ChipVariant;
  size?: ChipSize;
  style?: ViewStyle;
}

export default function Chip({ label, variant = 'accent', size = 'md', style }: ChipProps) {
  const bg =
    variant === 'accent' ? Colors.accent :
    variant === 'dark'   ? Colors.cardAlt :
    variant === 'on'     ? Colors.card :
    'rgba(245,244,239,0.09)';

  const color =
    variant === 'accent' ? Colors.accentInk :
    variant === 'dark'   ? Colors.cardAltInk :
    variant === 'on'     ? Colors.cardInk :
    Colors.cardAltInk;

  const borderColor =
    variant === 'accent' ? undefined :
    variant === 'on'     ? undefined :
    Colors.line;

  const py = size === 'sm' ? 4 : 5;
  const px = size === 'sm' ? 9 : 11;

  return (
    <View
      style={[
        {
          backgroundColor: bg,
          borderRadius: Radii.chip,
          paddingVertical: py,
          paddingHorizontal: px,
          alignSelf: 'flex-start',
          borderWidth: borderColor ? 1 : 0,
          borderColor,
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: Fonts.sansSemiBold,
          fontSize: FontSize.label,
          letterSpacing: 0.12 * FontSize.label,
          textTransform: 'uppercase',
          color,
        }}
      >
        {label}
      </Text>
    </View>
  );
}
