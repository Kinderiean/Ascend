import React from 'react';
import { View } from 'react-native';
import { Colors } from '../theme/tokens';

interface StepDotsProps {
  total: number;
  current: number;
  tone?: 'dark' | 'cream';
}

export default function StepDots({ total, current, tone = 'dark' }: StepDotsProps) {
  const activeColor = tone === 'dark' ? Colors.accent : Colors.cardInk;
  const inactiveColor = tone === 'dark' ? 'rgba(245,244,239,0.22)' : 'rgba(13,14,16,0.22)';

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => {
        const isActive = i === current;
        return (
          <View
            key={i}
            style={{
              width: isActive ? 18 : 5,
              height: 5,
              borderRadius: 999,
              backgroundColor: isActive ? activeColor : inactiveColor,
            }}
          />
        );
      })}
    </View>
  );
}
