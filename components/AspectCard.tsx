import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { AspectColors, Colors, Radii, Fonts, FontSize, Spacing } from '../theme/tokens';
import { Aspect } from '../lib/store';

const ASPECT_META: Record<Aspect, { name: string; blurb: string }> = {
  facial: { name: 'Facial', blurb: 'Jawline, symmetry & facial muscle training.' },
  physical: { name: 'Physical', blurb: 'Strength, cardio, nutrition, body comp.' },
  mental: { name: 'Mental', blurb: 'Focus, meditation, stress, clarity.' },
  spiritual: { name: 'Spiritual', blurb: 'Purpose, gratitude, inner peace.' },
  money: { name: 'Money', blurb: 'Income, savings, investing & wealth building.' },
  knowledge: { name: 'Knowledge', blurb: 'Reading, learning, skills & retention.' },
};

interface AspectCardProps {
  id: Aspect;
  selected: boolean;
  onToggle: (id: Aspect) => void;
}

export default function AspectCard({ id, selected, onToggle }: AspectCardProps) {
  const color = AspectColors[id];
  const meta = ASPECT_META[id];

  return (
    <TouchableOpacity
      onPress={() => onToggle(id)}
      activeOpacity={0.85}
      style={{
        borderRadius: Radii.row,
        minHeight: 96,
        padding: 14,
        backgroundColor: Colors.card,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.md,
      }}
    >
      {/* Color swatch */}
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: color, marginTop: 2 }} />

      {/* Text */}
      <View style={{ flex: 1 }}>
        <Text style={{
          fontFamily: Fonts.sansSemiBold,
          fontSize: FontSize.bodyLg,
          color: Colors.cardInk,
          marginBottom: 4,
        }}>{meta.name}</Text>
        <Text style={{
          fontFamily: Fonts.sans,
          fontSize: FontSize.label,
          color: 'rgba(13,14,16,0.6)',
          lineHeight: 16,
        }}>{meta.blurb}</Text>
      </View>

      {/* Selection badge */}
      <View style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: selected ? color : 'transparent',
        borderWidth: selected ? 0 : 1.5,
        borderColor: 'rgba(13,14,16,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2,
      }}>
        {selected && (
          <Text style={{ fontSize: 12, color: Colors.cardInk }}>✓</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

export { ASPECT_META };
