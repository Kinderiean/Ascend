import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, Radii, Fonts, FontSize, Shadows } from '../../theme/tokens';
import { useStore } from '../../lib/store';

type TabId = 'home' | 'aspects' | 'level' | 'buddy';

const TABS: { id: TabId; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'aspects', label: 'Aspects' },
  { id: 'level', label: 'Level' },
  { id: 'buddy', label: 'Buddy' },
];

function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const accentColor = useStore(s => s.accentColor) || Colors.accent;

  return (
    <View style={{
      position: 'absolute',
      bottom: insets.bottom + 12,
      left: 20,
      right: 20,
      height: 58,
      borderRadius: Radii.pill,
      backgroundColor: 'rgba(20,21,23,0.92)',
      borderWidth: 1,
      borderColor: 'rgba(245,244,239,0.10)',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 5,
      ...Shadows.cardLift,
    }}>
      {state.routes.map((route: any, i: number) => {
        const tab = TABS.find(t => t.id === route.name) || TABS[i];
        const isActive = state.index === i;
        return (
          <TouchableOpacity
            key={route.key}
            onPress={() => navigation.navigate(route.name)}
            activeOpacity={0.82}
            style={{
              flex: isActive ? 1.5 : 1,
              height: 46,
              borderRadius: Radii.pill,
              backgroundColor: isActive ? '#F5F4EF' : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <TabIcon id={tab?.id ?? 'home'} active={isActive} />
            {isActive && (
              <Text style={{
                fontFamily: Fonts.sansSemiBold,
                fontSize: FontSize.bodyMd,
                color: '#0D0E10',
                letterSpacing: 0.3,
              }}>{tab?.label}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

function TabIcon({ id, active }: { id: TabId; active: boolean }) {
  const color = active ? '#0D0E10' : 'rgba(245,244,239,0.50)';
  switch (id) {
    case 'home': return <HomeIcon color={color} />;
    case 'aspects': return <GridIcon color={color} />;
    case 'level': return <BoltIcon color={color} />;
    case 'buddy': return <PawIcon color={color} />;
    default: return <HomeIcon color={color} />;
  }
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="aspects" />
      <Tabs.Screen name="level" />
      <Tabs.Screen name="buddy" />
    </Tabs>
  );
}

function HomeIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', bottom: 0, left: 1, right: 1, height: 12, borderWidth: 1.8, borderColor: color, borderRadius: 2 }} />
      <View style={{ position: 'absolute', top: 0, width: 12, height: 9, borderLeftWidth: 1.8, borderRightWidth: 1.8, borderTopWidth: 1.8, borderColor: color, borderTopLeftRadius: 3, borderTopRightRadius: 3 }} />
    </View>
  );
}

function GridIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 18, flexWrap: 'wrap', flexDirection: 'row', gap: 3 }}>
      {[0, 1, 2, 3].map(i => (
        <View key={i} style={{ width: 7, height: 7, borderRadius: 2, borderWidth: 1.8, borderColor: color }} />
      ))}
    </View>
  );
}

function BoltIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 9,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color,
        marginBottom: -2,
      }} />
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: 5, borderRightWidth: 5, borderTopWidth: 9,
        borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color,
        marginTop: -2,
      }} />
    </View>
  );
}

function PawIcon({ color }: { color: string }) {
  return (
    <View style={{ width: 18, height: 18, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 10, height: 8, borderRadius: 5, borderWidth: 1.8, borderColor: color, marginBottom: 1 }} />
      <View style={{ flexDirection: 'row', gap: 2 }}>
        {[0, 1, 2].map(i => (
          <View key={i} style={{ width: 4, height: 4, borderRadius: 2, borderWidth: 1.5, borderColor: color }} />
        ))}
      </View>
    </View>
  );
}
