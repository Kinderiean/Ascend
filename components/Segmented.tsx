import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Colors, Radii, Fonts, FontSize, Spacing } from '../theme/tokens';

interface SegmentedProps {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  label?: string;
  tone?: 'cream' | 'dark';
}

export default function Segmented({ options, value, onChange, label, tone = 'cream' }: SegmentedProps) {
  const containerBg = tone === 'dark'
    ? 'rgba(245,244,239,0.1)'
    : 'rgba(13,14,16,0.08)';
  const activeBg = tone === 'dark' ? Colors.cardAlt : Colors.card;
  const ink = tone === 'dark' ? Colors.cardAltInk : Colors.cardInk;
  const mutedColor = tone === 'dark' ? 'rgba(245,244,239,0.5)' : 'rgba(13,14,16,0.45)';

  return (
    <View>
      {label ? (
        <Text style={{
          fontFamily: Fonts.sansSemiBold,
          fontSize: FontSize.label,
          textTransform: 'uppercase',
          letterSpacing: 0.08 * FontSize.label,
          color: mutedColor,
          marginBottom: Spacing.xs,
        }}>{label}</Text>
      ) : null}
      <View style={{
        flexDirection: 'row',
        backgroundColor: containerBg,
        borderRadius: 14,
        padding: 4,
        gap: 4,
      }}>
        {options.map(opt => {
          const isActive = opt === value;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onChange(opt)}
              activeOpacity={0.8}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 10,
                backgroundColor: isActive ? activeBg : 'transparent',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{
                fontFamily: Fonts.sansSemiBold,
                fontSize: FontSize.bodyMd,
                color: isActive ? ink : mutedColor,
              }}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
