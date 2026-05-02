import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { CompanionKind } from '../lib/store';

interface CompanionProps {
  kind: CompanionKind;
  size?: number;
  color?: string;
  mood?: 'idle' | 'happy' | 'sad' | 'nap';
  walk?: boolean;
}

// Simple color map per creature
const CREATURE_COLORS: Record<CompanionKind, string> = {
  cat: '#A9B1BB',
  dog: '#C99A7A',
  lion: '#E4B15A',
  tiger: '#C98A3A',
  horse: '#8FB8E0',
  unicorn: '#C9B8F5',
  parrot: '#4CBB73',
  elephant: '#A9B1BB',
  owl: '#7B8AA3',
  fox: '#F2A7B0',
};

function CreatureBody({ kind, size, color }: { kind: CompanionKind; size: number; color: string }) {
  const s = size;

  const earShape = (): { w: number; h: number; r: number } => {
    switch (kind) {
      case 'cat':
      case 'tiger':
      case 'owl':
      case 'fox':
        return { w: 10, h: 14, r: 2 };
      case 'dog':
        return { w: 14, h: 10, r: 8 };
      case 'lion':
      case 'unicorn':
        return { w: 12, h: 12, r: 6 };
      case 'horse':
        return { w: 8, h: 18, r: 4 };
      case 'parrot':
        return { w: 12, h: 10, r: 10 };
      case 'elephant':
        return { w: 22, h: 18, r: 10 };
      default:
        return { w: 10, h: 14, r: 2 };
    }
  };
  const ear = earShape();

  const headW = s * 0.5;
  const headH = s * 0.45;
  const bodyW = s * 0.55;
  const bodyH = s * 0.4;

  return (
    <View style={{ alignItems: 'center', width: s }}>

      {/* ── Lion mane ring (behind head) ── */}
      {kind === 'lion' && (
        <View style={{
          width: headW + 14, height: headH + 14,
          borderRadius: (headW + 14) / 2,
          backgroundColor: '#C88A30',
          position: 'absolute',
          top: ear.h - 10,
          alignSelf: 'center',
          zIndex: 0,
        }} />
      )}

      {/* Ears */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: s * 0.06, marginBottom: -4, zIndex: 2 }}>
        <View style={{ width: ear.w, height: ear.h, borderRadius: ear.r, backgroundColor: color }} />
        <View style={{ width: ear.w, height: ear.h, borderRadius: ear.r, backgroundColor: color }} />
      </View>

      {/* ── Unicorn horn ── */}
      {kind === 'unicorn' && (
        <View style={{
          width: 5, height: 14, borderRadius: 3,
          backgroundColor: '#E8C8FF',
          position: 'absolute', top: -8,
          zIndex: 3,
          transform: [{ rotate: '-5deg' }],
        }} />
      )}

      {/* ── Horse mane strip ── */}
      {kind === 'horse' && (
        <View style={{
          width: 6, height: headH * 0.7, borderRadius: 3,
          backgroundColor: '#5C88B0',
          position: 'absolute', top: ear.h - 2,
          alignSelf: 'center',
          zIndex: 3,
        }} />
      )}

      {/* Head */}
      <View style={{
        width: headW,
        height: headH,
        borderRadius: s * 0.25,
        backgroundColor: color,
        alignSelf: 'center',
        marginBottom: -3,
        alignItems: 'center',
        paddingTop: s * 0.1,
        zIndex: 2,
        overflow: 'hidden',
      }}>
        {/* ── Tiger head stripes ── */}
        {kind === 'tiger' && (
          <>
            <View style={{ position: 'absolute', top: 0, left: '22%', width: 3, height: '80%', backgroundColor: 'rgba(120,60,0,0.35)', borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: 0, left: '44%', width: 3, height: '90%', backgroundColor: 'rgba(120,60,0,0.35)', borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: 0, left: '66%', width: 3, height: '80%', backgroundColor: 'rgba(120,60,0,0.35)', borderRadius: 2 }} />
          </>
        )}

        {/* ── Owl big eyes (yellow iris ring) ── */}
        {kind === 'owl' ? (
          <View style={{ flexDirection: 'row', gap: s * 0.08, paddingHorizontal: s * 0.02, marginTop: 2 }}>
            {[0, 1].map(i => (
              <View key={i} style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: '#F2C94C', alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#1D1146' }} />
              </View>
            ))}
          </View>
        ) : (
          /* Regular eyes */
          <View style={{ flexDirection: 'row', gap: s * 0.1, paddingHorizontal: s * 0.04 }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#1D1146' }} />
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#1D1146' }} />
          </View>
        )}

        {/* Snout for dog/lion/tiger/fox */}
        {(['dog', 'lion', 'tiger', 'fox'] as CompanionKind[]).includes(kind) && (
          <View style={{ width: 8, height: 5, borderRadius: 3, backgroundColor: 'rgba(29,17,70,0.25)', marginTop: 2 }} />
        )}
        {/* Beak for parrot */}
        {kind === 'parrot' && (
          <View style={{ width: 8, height: 7, borderBottomLeftRadius: 6, borderBottomRightRadius: 2, backgroundColor: '#C98A3A', marginTop: 2 }} />
        )}
      </View>

      {/* ── Unicorn rainbow mane dots on side of head ── */}
      {kind === 'unicorn' && (
        <View style={{ position: 'absolute', right: s * 0.25 - 6, top: ear.h + 2, zIndex: 4 }}>
          {['#FF8FA3', '#FFD166', '#4CBB73', '#8FB8E0'].map((c, i) => (
            <View key={i} style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: c, marginBottom: 2 }} />
          ))}
        </View>
      )}

      {/* Body */}
      <View style={{
        width: kind === 'elephant' ? bodyW * 1.15 : bodyW,
        height: bodyH,
        borderRadius: s * 0.18,
        backgroundColor: color,
        alignSelf: 'center',
        zIndex: 2,
        overflow: 'hidden',
      }}>
        {/* ── Tiger body stripes ── */}
        {kind === 'tiger' && (
          <>
            <View style={{ position: 'absolute', top: 0, left: '20%', width: 3, height: '100%', backgroundColor: 'rgba(120,60,0,0.3)', borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: 0, left: '45%', width: 3, height: '100%', backgroundColor: 'rgba(120,60,0,0.35)', borderRadius: 2 }} />
            <View style={{ position: 'absolute', top: 0, left: '70%', width: 3, height: '100%', backgroundColor: 'rgba(120,60,0,0.3)', borderRadius: 2 }} />
          </>
        )}

        {/* ── Fox white chest patch ── */}
        {kind === 'fox' && (
          <View style={{
            width: bodyW * 0.4, height: bodyH * 0.6,
            borderRadius: bodyW * 0.2,
            backgroundColor: 'rgba(255,255,255,0.55)',
            position: 'absolute', bottom: 2,
            alignSelf: 'center',
          }} />
        )}

        {/* ── Parrot wing patch ── */}
        {kind === 'parrot' && (
          <View style={{
            width: bodyW * 0.45, height: bodyH * 0.55,
            borderRadius: bodyW * 0.2,
            backgroundColor: '#5AC87A',
            position: 'absolute', right: 4, top: 4,
          }} />
        )}

        {/* ── Elephant wrinkle lines ── */}
        {kind === 'elephant' && (
          <>
            <View style={{ position: 'absolute', top: '25%', left: '15%', width: '70%', height: 2, backgroundColor: 'rgba(29,17,70,0.1)', borderRadius: 1 }} />
            <View style={{ position: 'absolute', top: '55%', left: '10%', width: '80%', height: 2, backgroundColor: 'rgba(29,17,70,0.08)', borderRadius: 1 }} />
          </>
        )}

        {/* ── Elephant trunk ── */}
        {kind === 'elephant' && (
          <View style={{
            width: 9, height: 20, borderRadius: 5,
            backgroundColor: color,
            position: 'absolute', bottom: -16, left: '50%', marginLeft: -4,
          }} />
        )}
      </View>

      {/* ── Cat tail (rotated rect sticking out right) ── */}
      {kind === 'cat' && (
        <View style={{
          width: 5, height: bodyH * 0.85,
          borderRadius: 4,
          backgroundColor: color,
          position: 'absolute',
          bottom: 2,
          right: s * 0.1,
          transform: [{ rotate: '30deg' }],
          zIndex: 1,
        }} />
      )}

      {/* ── Dog tail ── */}
      {kind === 'dog' && (
        <View style={{
          width: 5, height: bodyH * 0.7,
          borderRadius: 4,
          backgroundColor: color,
          position: 'absolute',
          bottom: 4,
          right: s * 0.08,
          transform: [{ rotate: '45deg' }],
          zIndex: 1,
        }} />
      )}
    </View>
  );
}

export default function Companion({ kind, size = 60, color, mood = 'idle', walk = false }: CompanionProps) {
  const creatureColor = color || CREATURE_COLORS[kind];
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const walkAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -5, duration: 1100, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (!walk) return;
    let dir = 1;
    const step = () => {
      Animated.timing(walkAnim, {
        toValue: dir > 0 ? 55 : -55,
        duration: 2200,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) { dir *= -1; scaleAnim.setValue(dir); step(); }
      });
    };
    step();
    return () => walkAnim.stopAnimation();
  }, [walk]);

  return (
    <Animated.View
      style={{
        transform: [
          { translateY: bounceAnim },
          ...(walk ? [{ translateX: walkAnim }, { scaleX: scaleAnim }] : []),
        ],
        opacity: mood === 'nap' ? 0.5 : 1,
      }}
    >
      <CreatureBody kind={kind} size={size} color={creatureColor} />
    </Animated.View>
  );
}

export { CREATURE_COLORS };
