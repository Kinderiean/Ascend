import React from 'react';
import { TouchableOpacity, Text, ViewStyle, ActivityIndicator } from 'react-native';
import { Colors, Radii, Fonts, FontSize } from '../theme/tokens';

type Tone = 'dark' | 'cream' | 'accent' | 'soft' | 'ghost' | 'ghostDark';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  tone?: Tone;
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  size?: 'default' | 'lg';
}

export default function PillButton({
  label, onPress, tone = 'dark', fullWidth, disabled, loading, style, size = 'default',
}: PillButtonProps) {
  const height = size === 'lg' ? 54 : 48;

  const bg =
    tone === 'dark'     ? Colors.card :       // white/cream fill — inverted (primary CTA)
    tone === 'cream'    ? Colors.card :
    tone === 'accent'   ? Colors.accent :
    tone === 'soft'     ? '#1C1E21' :          // v2 soft — dark nested surface
    'transparent';

  const color =
    tone === 'dark'     ? Colors.cardInk :     // dark text on cream
    tone === 'cream'    ? Colors.cardInk :
    tone === 'accent'   ? Colors.accentInk :
    tone === 'soft'     ? Colors.cardAltInk :
    tone === 'ghost'    ? Colors.cardAltInk :  // cream text on transparent
    Colors.cardInk;

  const borderColor =
    tone === 'ghost'     ? Colors.lineStrong :
    tone === 'ghostDark' ? 'rgba(13,14,16,0.25)' :
    undefined;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        {
          height,
          paddingHorizontal: 22,
          borderRadius: Radii.pill,
          backgroundColor: bg,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: disabled ? 0.4 : 1,
          borderWidth: borderColor ? 1 : 0,
          borderColor,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} size="small" />
      ) : (
        <Text
          style={{
            fontFamily: Fonts.sansSemiBold,
            fontSize: FontSize.bodyMd,
            letterSpacing: 0.06 * FontSize.bodyMd,
            textTransform: 'uppercase',
            color,
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
