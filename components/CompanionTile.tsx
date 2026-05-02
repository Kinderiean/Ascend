import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { CompanionKind, DEFAULT_COMPANION_NAMES } from '../lib/store';
import { Colors, Radii, Fonts, FontSize } from '../theme/tokens';
import Companion, { CREATURE_COLORS } from './Companion';

const CREATURE_TRAITS: Record<CompanionKind, string> = {
  cat: 'calm · observant',
  dog: 'loyal · energetic',
  lion: 'bold · leader',
  tiger: 'fierce · focused',
  horse: 'steady · enduring',
  unicorn: 'magical · playful',
  parrot: 'chatty · witty',
  elephant: 'wise · memory',
  owl: 'thoughtful · night',
  fox: 'clever · sly',
};

interface CompanionTileProps {
  kind: CompanionKind;
  selected: boolean;
  onSelect: (k: CompanionKind) => void;
}

export default function CompanionTile({ kind, selected, onSelect }: CompanionTileProps) {
  const name = DEFAULT_COMPANION_NAMES[kind];
  const trait = CREATURE_TRAITS[kind];

  return (
    <TouchableOpacity
      onPress={() => onSelect(kind)}
      activeOpacity={0.85}
      style={{
        borderRadius: Radii.tile,
        padding: 10,
        backgroundColor: selected ? Colors.cardAlt : 'rgba(245,244,239,0.06)',
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? Colors.accent : 'rgba(245,244,239,0.12)',
        alignItems: 'center',
        gap: 4,
      }}
    >
      <View style={{ height: 60, alignItems: 'center', justifyContent: 'center' }}>
        <Companion kind={kind} size={52} />
      </View>
      <Text style={{
        fontFamily: Fonts.sansSemiBold,
        fontSize: 12,
        color: Colors.cardAltInk,
        textAlign: 'center',
      }}>{name}</Text>
      <Text style={{
        fontFamily: Fonts.sans,
        fontSize: 9,
        color: 'rgba(245,244,239,0.6)',
        textAlign: 'center',
      }}>{trait}</Text>
    </TouchableOpacity>
  );
}
