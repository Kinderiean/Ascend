import React from 'react';
import { View } from 'react-native';
import { Colors } from '../theme/tokens';

interface BarProgressProps {
  value: number;
  total: number;
  accent?: string;
  dark?: boolean;
  height?: number;
  segments?: number; // legacy — ignored
}

export default function BarProgress({
  value,
  total,
  accent = Colors.accent,
  dark = false,
  height = 6,
}: BarProgressProps) {
  const pct = Math.min(1, Math.max(0, total > 0 ? value / total : 0));
  const trackColor = dark
    ? 'rgba(245,244,239,0.12)'
    : 'rgba(13,14,16,0.10)';

  return (
    <View style={{
      height,
      borderRadius: 999,
      backgroundColor: trackColor,
      overflow: 'hidden',
    }}>
      <View style={{
        width: `${pct * 100}%`,
        height: '100%',
        borderRadius: 999,
        backgroundColor: accent,
      }} />
    </View>
  );
}
