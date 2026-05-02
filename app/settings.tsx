import React, { useState } from 'react';
import {
  View, Text, ScrollView, StatusBar, TouchableOpacity, Alert,
  Modal, TextInput, KeyboardAvoidingView, Platform, FlatList, Linking,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore, Aspect, CompanionKind } from '../lib/store';
import { ENV } from '../lib/env';
import { useAuthSession, useEntitlement, signOut, deleteAccount } from '../lib/auth';
import { useColors } from '../lib/theme';
import { Colors, Fonts, FontSize, Spacing, Radii, AspectColors } from '../theme/tokens';
import Companion from '../components/Companion';
import CompanionTile from '../components/CompanionTile';

const ALL_COMPANIONS: CompanionKind[] = [
  'cat', 'dog', 'lion', 'tiger', 'horse',
  'unicorn', 'parrot', 'elephant', 'owl', 'fox',
];

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  const past = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - past.getTime()) / (1000 * 60 * 60 * 24));
}

const ALL_ASPECTS: { id: Aspect; name: string; color: string }[] = [
  { id: 'facial', name: 'Facial', color: '#E8B4BC' },
  { id: 'physical', name: 'Physical', color: '#D9A876' },
  { id: 'mental', name: 'Mental', color: '#C9B8F5' },
  { id: 'spiritual', name: 'Spiritual', color: '#A8D9B8' },
  { id: 'money', name: 'Money', color: '#10b981' },
  { id: 'knowledge', name: 'Knowledge', color: '#8A97AD' },
];

// ──────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{
      fontFamily: Fonts.monoMedium,
      fontSize: 10,
      color: 'rgba(245,244,239,0.4)',
      textTransform: 'uppercase',
      letterSpacing: 1.8,
      paddingHorizontal: 4,
      marginTop: Spacing.sm,
    }}>{label}</Text>
  );
}

function SettingRow({
  title, sub, left, right, last = false,
}: {
  title: string;
  sub?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  last?: boolean;
}) {
  const C = useColors();
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 18,
      borderBottomWidth: last ? 0 : 1,
      borderBottomColor: 'rgba(13,14,16,0.06)',
      gap: 12,
    }}>
      {left && <View style={{ width: 34, alignItems: 'center' }}>{left}</View>}
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 14, color: C.cardInk }}>{title}</Text>
        {sub ? (
          <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: 'rgba(13,14,16,0.5)', marginTop: 2 }}>{sub}</Text>
        ) : null}
      </View>
      {right && <View style={{ alignItems: 'flex-end' }}>{right}</View>}
    </View>
  );
}

function SettingGroup({ children }: { children: React.ReactNode }) {
  const C = useColors();
  return (
    <View style={{
      backgroundColor: C.card,
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {children}
    </View>
  );
}

function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  const C = useColors();
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      style={{
        width: 40,
        height: 24,
        borderRadius: 12,
        backgroundColor: value ? C.cardInk : 'rgba(13,14,16,0.15)',
        justifyContent: 'center',
        paddingHorizontal: 2,
      }}
    >
      <View style={{
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: C.card,
        alignSelf: value ? 'flex-end' : 'flex-start',
      }} />
    </TouchableOpacity>
  );
}

function InlineSelect<T extends string>({
  options, value, onChange,
}: {
  options: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  const C = useColors();
  return (
    <View style={{
      flexDirection: 'row',
      borderRadius: 999,
      padding: 3,
      backgroundColor: 'rgba(13,14,16,0.06)',
    }}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          onPress={() => onChange(opt)}
          style={{
            paddingVertical: 4,
            paddingHorizontal: 10,
            borderRadius: 999,
            backgroundColor: value === opt ? C.cardInk : 'transparent',
          }}
        >
          <Text style={{
            fontFamily: Fonts.sansSemiBold,
            fontSize: 10,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
            color: value === opt ? C.card : C.cardInk,
          }}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ChipBtn({ label, onPress, destructive = false }: { label: string; onPress: () => void; destructive?: boolean }) {
  const C = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: destructive ? 'transparent' : C.cardInk,
        borderWidth: destructive ? 1 : 0,
        borderColor: destructive ? '#B8312E' : undefined,
      }}
    >
      <Text style={{
        fontFamily: Fonts.sansSemiBold,
        fontSize: 10,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        color: destructive ? '#B8312E' : C.card,
      }}>{label}</Text>
    </TouchableOpacity>
  );
}

// ──────────────────────────────────────────
// Main screen
// ──────────────────────────────────────────

export default function SettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();

  const {
    name, age, height, weight, goalText, units,
    xp, streakDays, aspects,
    companion, companionName, lastCompanionChangeAt,
    accentColor, theme,
    setName, setAge, setHeight, setWeight, setGoalText,
    setAccentColor, setTheme,
    setCompanion, setCompanionName,
    toggleAspect,
    resetApp,
  } = useStore();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editAge, setEditAge] = useState(age);
  const [editHeight, setEditHeight] = useState(height);
  const [editWeight, setEditWeight] = useState(weight);
  const [editGoal, setEditGoal] = useState(goalText);

  function openEdit() {
    setEditName(name);
    setEditAge(age);
    setEditHeight(height);
    setEditWeight(weight);
    setEditGoal(goalText);
    setEditOpen(true);
  }

  function saveEdit() {
    if (editName.trim()) setName(editName.trim());
    if (editAge.trim()) setAge(editAge.trim());
    if (editHeight.trim()) setHeight(editHeight.trim());
    if (editWeight.trim()) setWeight(editWeight.trim());
    setGoalText(editGoal.trim());
    setEditOpen(false);
  }

  const [aspectsOpen, setAspectsOpen] = useState(false);
  const [draftAspects, setDraftAspects] = useState<Aspect[]>([]);

  function openAspectsPicker() {
    setDraftAspects([...aspects]);
    setAspectsOpen(true);
  }

  function toggleDraftAspect(id: Aspect) {
    setDraftAspects(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 3) {
          Alert.alert('Minimum 3', 'You must keep at least 3 aspects active.');
          return prev;
        }
        return prev.filter(a => a !== id);
      }
      return [...prev, id];
    });
  }

  function saveAspects() {
    if (draftAspects.length < 3) {
      Alert.alert('Minimum 3', 'Select at least 3 aspects.');
      return;
    }
    // Sync draft to store
    const toAdd = draftAspects.filter(a => !aspects.includes(a));
    const toRemove = aspects.filter(a => !draftAspects.includes(a));
    toAdd.forEach(a => toggleAspect(a));
    toRemove.forEach(a => toggleAspect(a));
    setAspectsOpen(false);
  }

  const [companionPickerOpen, setCompanionPickerOpen] = useState(false);
  const [draftCompanion, setDraftCompanion] = useState<CompanionKind>(companion);
  const daysSinceChange = daysSince(lastCompanionChangeAt);
  const canChangeCompanion = daysSinceChange >= 7;

  function openCompanionPicker() {
    setDraftCompanion(companion);
    setCompanionPickerOpen(true);
  }

  function saveCompanion() {
    setCompanion(draftCompanion);
    setCompanionPickerOpen(false);
  }

  const [quietHours, setQuietHours] = useState(true);
  const [nudgeFreq, setNudgeFreq] = useState<'Sparse' | 'Balanced' | 'Chatty'>('Balanced');
  const [walkAnim, setWalkAnim] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [levelTests, setLevelTests] = useState(true);
  const [buddyNudges, setBuddyNudges] = useState(true);

  const firstName = name ? name.split(' ')[0] : 'User';
  const monogram = firstName[0]?.toUpperCase() ?? 'A';
  const level = Math.max(1, Math.floor((xp ?? 0) / 500) + 1);

  const ACCENT_OPTIONS = ['#C9B8F5', '#4CBB73', '#C98A3A', '#F2A7B0'] as const;

  const { user } = useAuthSession();
  const entitlement = useEntitlement();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const canConfirmDelete = deleteConfirm === 'DELETE';

  async function performSignOut() {
    await signOut();
    router.replace('/(auth)/signin' as any);
  }

  async function performDelete() {
    if (!canConfirmDelete) return;
    if (user) {
      const r = await deleteAccount();
      if (!r.success) {
        Alert.alert('Could not delete', r.error);
        return;
      }
    }
    resetApp();
    setDeleteOpen(false);
    setDeleteConfirm('');
    router.replace(user ? '/(auth)/signin' as any : '/(onboarding)/welcome' as any);
  }

  function openLegalLink(url: string) {
    Linking.openURL(url).catch(() => Alert.alert('Cannot open link', 'Please check your internet connection.'));
  }

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle={C.bg === "#0D0E10" ? "light-content" : "dark-content"} backgroundColor={C.bg} />

      {/* Header */}
      <View style={{
        paddingTop: insets.top + 12,
        paddingBottom: 12,
        paddingHorizontal: Spacing['2xl'],
        flexDirection: 'row',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ width: 44, height: 44, justifyContent: 'center' }}>
          <Text style={{ color: C.cardAltInk, fontSize: 20, fontFamily: Fonts.sans }}>‹</Text>
        </TouchableOpacity>
        <Text style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: Fonts.monoMedium,
          fontSize: 11,
          color: 'rgba(245,244,239,0.6)',
          textTransform: 'uppercase',
          letterSpacing: 2,
          marginRight: 44,
        }}>Settings</Text>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Spacing['2xl'],
          paddingBottom: 120,
          gap: 10,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <SettingGroup>
          <TouchableOpacity activeOpacity={0.85} onPress={openEdit}>
            <View style={{ flexDirection: 'row', alignItems: 'center', padding: 22, gap: 16 }}>
              <LinearGradient
                colors={['#C9B8F5', '#F2A7B0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ fontFamily: Fonts.serif, fontSize: 28, color: C.cardInk }}>{monogram}</Text>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: Fonts.serif, fontSize: 26, color: C.cardInk, lineHeight: 30 }}>{firstName}</Text>
                <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: 'rgba(13,14,16,0.55)', marginTop: 2 }}>
                  LV {level} · {aspects.length} aspect{aspects.length !== 1 ? 's' : ''} active
                </Text>
              </View>
              <Text style={{ color: 'rgba(13,14,16,0.3)', fontSize: 18 }}>›</Text>
            </View>
          </TouchableOpacity>
        </SettingGroup>

        {/* Buddy */}
        <SectionLabel label="Buddy" />
        <SettingGroup>
          <SettingRow
            title={companionName}
            sub="Your companion"
            left={<Companion kind={companion} size={34} mood="idle" />}
            right={<ChipBtn label="Rename" onPress={() => {
              Alert.prompt(
                'Rename buddy',
                '',
                (text) => { if (text?.trim()) setCompanionName(text.trim()); },
                'plain-text',
                companionName,
              );
            }} />}
          />
          <SettingRow
            title="Change companion"
            sub={canChangeCompanion ? 'Pick a new buddy' : `Available in ${7 - daysSinceChange} day${7 - daysSinceChange !== 1 ? 's' : ''}`}
            right={
              <ChipBtn
                label="Change"
                onPress={canChangeCompanion ? openCompanionPicker : () => {}}
              />
            }
          />
          <SettingRow
            title="Quiet hours"
            sub="10pm – 7am"
            right={<Toggle value={quietHours} onValueChange={setQuietHours} />}
          />
          <SettingRow
            title="Nudge frequency"
            sub="How often your buddy talks"
            right={
              <InlineSelect
                options={['Sparse', 'Balanced', 'Chatty'] as const}
                value={nudgeFreq}
                onChange={setNudgeFreq}
              />
            }
          />
          <SettingRow
            title="Walk animation"
            sub="Show buddy moving around"
            right={<Toggle value={walkAnim} onValueChange={setWalkAnim} />}
            last
          />
        </SettingGroup>

        {/* Appearance */}
        <SectionLabel label="Appearance" />
        <SettingGroup>
          <SettingRow
            title="Theme"
            right={
              <InlineSelect
                options={['Dark', 'Light'] as const}
                value={theme === 'dark' ? 'Dark' : 'Light'}
                onChange={(v) => setTheme(v === 'Dark' ? 'dark' : 'light')}
              />
            }
          />
          <SettingRow
            title="Accent color"
            right={
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {ACCENT_OPTIONS.map(color => (
                  <TouchableOpacity
                    key={color}
                    onPress={() => setAccentColor(color)}
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 11,
                      backgroundColor: color,
                      borderWidth: accentColor === color ? 2 : 0,
                      borderColor: C.cardInk,
                    }}
                  />
                ))}
              </View>
            }
            last
          />
        </SettingGroup>

        {/* Notifications */}
        <SectionLabel label="Notifications" />
        <SettingGroup>
          <SettingRow
            title="Daily reminder"
            sub="Routine starts in the morning"
            right={<Toggle value={dailyReminder} onValueChange={setDailyReminder} />}
          />
          <SettingRow
            title="Level tests"
            sub="When a test becomes available"
            right={<Toggle value={levelTests} onValueChange={setLevelTests} />}
          />
          <SettingRow
            title="Buddy nudges"
            sub="Light check-ins during the day"
            right={<Toggle value={buddyNudges} onValueChange={setBuddyNudges} />}
            last
          />
        </SettingGroup>

        {/* Aspects */}
        <SectionLabel label="Aspects" />
        <SettingGroup>
          <SettingRow
            title="Active aspects"
            sub={`${aspects.length} of ${ALL_ASPECTS.length} selected`}
            right={<ChipBtn label="Manage" onPress={openAspectsPicker} />}
          />
          <SettingRow
            title="Weekly goal"
            sub="Days per week you commit to"
            right={
              <InlineSelect
                options={['3', '5', '7'] as const}
                value="5"
                onChange={() => {}}
              />
            }
            last
          />
        </SettingGroup>

        {/* Account */}
        <SectionLabel label="Account" />
        <SettingGroup>
          {user ? (
            <>
              <SettingRow
                title={user.email ?? 'Signed in'}
                sub={entitlement.isLifetime ? 'Plus · Lifetime' : entitlement.isPlus ? 'Plus subscriber' : 'Free plan'}
              />
              {!entitlement.isPlus && (
                <SettingRow
                  title="Upgrade to Plus"
                  sub="Unlock all routines, companions, cloud sync"
                  right={<ChipBtn label="Upgrade" onPress={() => router.push('/paywall' as any)} />}
                />
              )}
              <SettingRow
                title="Sign out"
                right={<ChipBtn label="Sign out" onPress={performSignOut} />}
                last
              />
            </>
          ) : (
            <SettingRow
              title="Not signed in"
              sub="Sign in to sync across devices and unlock Plus"
              right={<ChipBtn label="Sign in" onPress={() => router.push('/(auth)/signin' as any)} />}
              last
            />
          )}
        </SettingGroup>

        {/* Legal */}
        <SectionLabel label="Legal" />
        <SettingGroup>
          <SettingRow
            title="Privacy Policy"
            right={<ChipBtn label="Open" onPress={() => openLegalLink(ENV.PRIVACY_URL)} />}
          />
          <SettingRow
            title="Terms of Use"
            right={<ChipBtn label="Open" onPress={() => openLegalLink(ENV.TERMS_URL)} />}
          />
          <SettingRow
            title="EULA"
            right={<ChipBtn label="Open" onPress={() => openLegalLink(ENV.EULA_URL)} />}
            last
          />
        </SettingGroup>

        {/* Data & privacy */}
        <SectionLabel label="Data & Privacy" />
        <SettingGroup>
          <SettingRow
            title="Export my data"
            sub="Download your profile, tasks, and progress as JSON"
            right={<ChipBtn label="Export" onPress={() => Alert.alert('Export', 'Data export coming in v1.1.')} />}
          />
          <SettingRow
            title="Delete my account"
            sub="Permanently erase all data. Cannot be undone."
            right={<ChipBtn label="Delete" onPress={() => { setDeleteConfirm(''); setDeleteOpen(true); }} destructive />}
            last
          />
        </SettingGroup>

        {/* About */}
        <SectionLabel label="About" />
        <SettingGroup>
          <SettingRow title="Version" sub="1.0.0 · build 1" last />
        </SettingGroup>

        {/* Footer */}
        <View style={{ alignItems: 'center', paddingVertical: Spacing.xl }}>
          <Text style={{
            fontFamily: Fonts.mono,
            fontSize: 10,
            color: 'rgba(245,244,239,0.35)',
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}>ASCEND · MADE WITH CARE</Text>
        </View>
      </ScrollView>

      {/* Companion Picker Modal */}
      <Modal
        visible={companionPickerOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCompanionPickerOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            paddingTop: 20, paddingBottom: 14, paddingHorizontal: 24,
            borderBottomWidth: 1, borderBottomColor: 'rgba(245,244,239,0.06)',
          }}>
            <TouchableOpacity onPress={() => setCompanionPickerOpen(false)} style={{ width: 60 }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 15, color: 'rgba(245,244,239,0.5)' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{
              flex: 1, textAlign: 'center',
              fontFamily: Fonts.monoMedium, fontSize: 11,
              color: 'rgba(245,244,239,0.6)',
              textTransform: 'uppercase', letterSpacing: 2,
            }}>Choose Companion</Text>
            <TouchableOpacity onPress={saveCompanion} style={{ width: 60, alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 15, color: '#C9B8F5' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={ALL_COMPANIONS}
            keyExtractor={item => item}
            numColumns={2}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            columnWrapperStyle={{ gap: 10 }}
            renderItem={({ item }) => (
              <View style={{ flex: 1 }}>
                <CompanionTile
                  kind={item}
                  selected={draftCompanion === item}
                  onSelect={setDraftCompanion}
                />
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Aspects Picker Modal */}
      <Modal
        visible={aspectsOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAspectsOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 20,
            paddingBottom: 14,
            paddingHorizontal: 24,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(245,244,239,0.06)',
          }}>
            <TouchableOpacity onPress={() => setAspectsOpen(false)} style={{ width: 60 }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 15, color: 'rgba(245,244,239,0.5)' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{
              flex: 1, textAlign: 'center',
              fontFamily: Fonts.monoMedium, fontSize: 11,
              color: 'rgba(245,244,239,0.6)',
              textTransform: 'uppercase', letterSpacing: 2,
            }}>Manage Aspects</Text>
            <TouchableOpacity onPress={saveAspects} style={{ width: 60, alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 15, color: '#C9B8F5' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <Text style={{
            fontFamily: Fonts.sans, fontSize: 12,
            color: 'rgba(245,244,239,0.4)',
            textAlign: 'center',
            paddingVertical: 12,
            paddingHorizontal: 32,
          }}>
            Select at least 3 aspects. Tap to toggle on or off.
          </Text>

          <FlatList
            data={ALL_ASPECTS}
            keyExtractor={item => item.id}
            numColumns={2}
            contentContainerStyle={{ padding: 16, gap: 10 }}
            columnWrapperStyle={{ gap: 10 }}
            renderItem={({ item }) => {
              const active = draftAspects.includes(item.id);
              return (
                <TouchableOpacity
                  onPress={() => toggleDraftAspect(item.id)}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    borderRadius: 16,
                    padding: 18,
                    backgroundColor: active ? item.color + '22' : C.card,
                    borderWidth: 2,
                    borderColor: active ? item.color : 'transparent',
                    alignItems: 'center',
                    gap: 8,
                    minHeight: 80,
                    justifyContent: 'center',
                  }}
                >
                  <View style={{
                    width: 32, height: 32, borderRadius: 16,
                    backgroundColor: item.color + (active ? 'EE' : '55'),
                    alignItems: 'center', justifyContent: 'center',
                  }} />
                  <Text style={{
                    fontFamily: active ? Fonts.sansSemiBold : Fonts.sans,
                    fontSize: 13,
                    color: active ? item.color : 'rgba(245,244,239,0.6)',
                    textAlign: 'center',
                  }}>{item.name}</Text>
                  {active && (
                    <View style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 16, height: 16, borderRadius: 8,
                      backgroundColor: item.color,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Text style={{ fontSize: 9, color: '#0D0E10', fontFamily: Fonts.sansSemiBold }}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />

          <View style={{
            padding: 20,
            paddingBottom: 36,
            alignItems: 'center',
          }}>
            <Text style={{
              fontFamily: Fonts.mono, fontSize: 11,
              color: 'rgba(245,244,239,0.35)',
            }}>
              {draftAspects.length} selected
              {draftAspects.length < 3 ? ' · need at least 3' : ''}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Delete Account Modal */}
      <Modal
        visible={deleteOpen}
        animationType="fade"
        transparent
        onRequestClose={() => setDeleteOpen(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <View style={{
              backgroundColor: C.card,
              borderRadius: 22,
              padding: 24,
              gap: 14,
            }}>
              <Text style={{
                fontFamily: Fonts.serif,
                fontSize: 24,
                color: '#B5423A',
              }}>Delete account?</Text>
              <Text style={{
                fontFamily: Fonts.sans,
                fontSize: 13,
                color: 'rgba(13,14,16,0.65)',
                lineHeight: 13 * 1.55,
              }}>
                This permanently erases your profile, streaks, tasks, custom routines, and all
                progress on this device. If you have an active subscription, please cancel it from
                the App Store / Play Store first.{'\n\n'}
                Type <Text style={{ fontFamily: Fonts.sansBold, color: '#B5423A' }}>DELETE</Text> below to confirm.
              </Text>
              <TextInput
                value={deleteConfirm}
                onChangeText={(t) => setDeleteConfirm(t.toUpperCase().slice(0, 6))}
                autoCapitalize="characters"
                autoCorrect={false}
                placeholder="DELETE"
                placeholderTextColor="rgba(13,14,16,0.3)"
                style={{
                  borderWidth: 1,
                  borderColor: canConfirmDelete ? '#B5423A' : 'rgba(13,14,16,0.15)',
                  borderRadius: 12,
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  fontFamily: Fonts.monoMedium,
                  fontSize: 15,
                  color: C.cardInk,
                  letterSpacing: 2,
                }}
              />
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
                <TouchableOpacity
                  onPress={() => { setDeleteOpen(false); setDeleteConfirm(''); }}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(13,14,16,0.15)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 13, color: C.cardInk }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={performDelete}
                  disabled={!canConfirmDelete}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 12,
                    backgroundColor: canConfirmDelete ? '#B5423A' : 'rgba(181,66,58,0.3)',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 13, color: '#fff' }}>
                    Delete forever
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        visible={editOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditOpen(false)}
      >
        <KeyboardAvoidingView
          style={{ flex: 1, backgroundColor: C.bg }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Modal header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 20,
            paddingBottom: 14,
            paddingHorizontal: 24,
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(245,244,239,0.06)',
          }}>
            <TouchableOpacity onPress={() => setEditOpen(false)} style={{ width: 60 }}>
              <Text style={{ fontFamily: Fonts.sans, fontSize: 15, color: 'rgba(245,244,239,0.5)' }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{
              flex: 1, textAlign: 'center',
              fontFamily: Fonts.monoMedium, fontSize: 11,
              color: 'rgba(245,244,239,0.6)',
              textTransform: 'uppercase', letterSpacing: 2,
            }}>Edit Profile</Text>
            <TouchableOpacity onPress={saveEdit} style={{ width: 60, alignItems: 'flex-end' }}>
              <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 15, color: '#C9B8F5' }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 24, gap: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <EditField
              label="Full name"
              value={editName}
              onChange={setEditName}
              placeholder="Your name"
            />
            <EditField
              label="Age"
              value={editAge}
              onChange={setEditAge}
              placeholder="e.g. 22"
              keyboardType="numeric"
            />
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <EditField
                  label={`Height (${units === 'metric' ? 'cm' : 'in'})`}
                  value={editHeight}
                  onChange={setEditHeight}
                  placeholder={units === 'metric' ? '175' : '69'}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <EditField
                  label={`Weight (${units === 'metric' ? 'kg' : 'lbs'})`}
                  value={editWeight}
                  onChange={setEditWeight}
                  placeholder={units === 'metric' ? '75' : '165'}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <Text style={{
                fontFamily: Fonts.monoMedium, fontSize: 10,
                color: 'rgba(245,244,239,0.4)',
                textTransform: 'uppercase', letterSpacing: 1.5,
              }}>Goal / Vision</Text>
              <TextInput
                value={editGoal}
                onChangeText={setEditGoal}
                placeholder="Describe where you want to be in 3 months..."
                placeholderTextColor="rgba(245,244,239,0.2)"
                multiline
                style={{
                  backgroundColor: 'rgba(245,244,239,0.06)',
                  borderRadius: 14,
                  padding: 14,
                  fontFamily: Fonts.sans,
                  fontSize: 14,
                  color: C.cardAltInk,
                  minHeight: 100,
                  textAlignVertical: 'top',
                  borderWidth: 1,
                  borderColor: 'rgba(245,244,239,0.1)',
                }}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function EditField({
  label, value, onChange, placeholder, keyboardType,
}: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder: string; keyboardType?: 'numeric' | 'default';
}) {
  const C = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{
        fontFamily: Fonts.monoMedium, fontSize: 10,
        color: 'rgba(245,244,239,0.4)',
        textTransform: 'uppercase', letterSpacing: 1.5,
      }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="rgba(245,244,239,0.2)"
        keyboardType={keyboardType ?? 'default'}
        style={{
          backgroundColor: 'rgba(245,244,239,0.06)',
          borderRadius: 12,
          padding: 14,
          fontFamily: Fonts.sans,
          fontSize: 15,
          color: C.cardAltInk,
          borderWidth: 1,
          borderColor: 'rgba(245,244,239,0.1)',
        }}
      />
    </View>
  );
}
