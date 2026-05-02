import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Fonts, FontSize, Shadows } from '../theme/tokens';

type Tab = 'home' | 'aspects' | 'level' | 'buddy';

interface TabBarProps {
  current: Tab;
  onChange: (t: Tab) => void;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'home', label: 'Home', icon: <HomeIcon /> },
  { id: 'aspects', label: 'Aspects', icon: <GridIcon /> },
  { id: 'level', label: 'Level', icon: <BoltIcon /> },
  { id: 'buddy', label: 'Buddy', icon: <PawIcon /> },
];

export default function TabBar({ current, onChange }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={{
      position: 'absolute',
      bottom: insets.bottom + 16,
      left: 20,
      right: 20,
      height: 56,
      borderRadius: Radii.pill,
      backgroundColor: Colors.card,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 6,
      ...Shadows.cardLift,
    }}>
      {TABS.map(tab => {
        const isActive = tab.id === current;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onChange(tab.id)}
            activeOpacity={0.8}
            style={{
              flex: isActive ? 1.4 : 1,
              height: 44,
              borderRadius: Radii.pill,
              backgroundColor: isActive ? Colors.accent : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <View style={{ opacity: isActive ? 1 : 0.45 }}>
              {tab.icon}
            </View>
            {isActive && (
              <Text style={{
                fontFamily: Fonts.sansSemiBold,
                fontSize: FontSize.bodyMd,
                color: Colors.accentInk,
                letterSpacing: 0.3,
              }}>{tab.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function HomeIcon() {
  return (
    <View style={{ width: 18, height: 18 }}>
      <View style={{ position: 'absolute', top: 2, left: 1, right: 1, bottom: 0, borderWidth: 1.8, borderColor: Colors.cardInk, borderRadius: 3 }} />
      <View style={{ position: 'absolute', top: 0, left: '50%', marginLeft: -5, width: 10, height: 8, borderWidth: 1.8, borderColor: Colors.cardInk, borderRadius: 2 }} />
    </View>
  );
}

function GridIcon() {
  return (
    <View style={{ width: 18, height: 18, flexWrap: 'wrap', flexDirection: 'row', gap: 2 }}>
      {[0,1,2,3].map(i => (
        <View key={i} style={{ width: 7, height: 7, borderRadius: 2, borderWidth: 1.8, borderColor: Colors.cardInk }} />
      ))}
    </View>
  );
}

function BoltIcon() {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 8, height: 16, borderWidth: 1.8, borderColor: Colors.cardInk, transform: [{ skewX: '-8deg' }] }} />
    </View>
  );
}

function PawIcon() {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 10, height: 8, borderRadius: 5, borderWidth: 1.8, borderColor: Colors.cardInk, marginTop: 4 }} />
      <View style={{ flexDirection: 'row', gap: 3, marginTop: -2 }}>
        {[0,1,2].map(i => (
          <View key={i} style={{ width: 4, height: 4, borderRadius: 2, borderWidth: 1.5, borderColor: Colors.cardInk }} />
        ))}
      </View>
    </View>
  );
}
