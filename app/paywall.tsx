import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator,
  StatusBar, Linking, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useColors } from '../lib/theme';
import { Fonts, FontSize, Spacing, Radii } from '../theme/tokens';
import { ENV } from '../lib/env';
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
} from '../lib/iap';
import { useEntitlement } from '../lib/auth';

const PERKS = [
  'Unlimited pet chat (free is 30 / day)',
  'Full personalized skincare + facial routines + ingredient warnings',
  'Full 5-day PPL gym plan + custom splits',
  'All 10 companions, switch anytime',
  'Progress photo timeline with side-by-side compare',
  'Cloud sync across devices',
  'Money charts + monthly summaries',
  'Full book library (40+ summaries)',
  'Smart contextual notifications',
  'Hard challenges + JSON / CSV data export',
];

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const C = useColors();
  const ent = useEntitlement();

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  useEffect(() => {
    (async () => {
      const o = await getOfferings();
      setOffering(o);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (ent.isPlus) router.back();
  }, [ent.isPlus]);

  const annualPkg: PurchasesPackage | undefined = offering?.annual ?? offering?.availablePackages.find((p) => p.packageType === 'ANNUAL');
  const monthlyPkg: PurchasesPackage | undefined = offering?.monthly ?? offering?.availablePackages.find((p) => p.packageType === 'MONTHLY');

  async function onPurchase() {
    const pkg = selectedPlan === 'annual' ? annualPkg : monthlyPkg;
    if (!pkg) {
      Alert.alert('Not available', 'This subscription is not available right now. Please try again later.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPurchasing(true);
    const r = await purchasePackage(pkg);
    setPurchasing(false);
    if (r.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } else if (!r.cancelled && r.error) {
      Alert.alert('Purchase failed', r.error);
    }
  }

  async function onRestore() {
    setPurchasing(true);
    const r = await restorePurchases();
    setPurchasing(false);
    if (r.success) {
      Alert.alert('Restored', 'Your subscription has been restored.');
      router.back();
    } else {
      Alert.alert('Nothing to restore', 'No active Plus subscription found for this account.');
    }
  }

  const annualPrice = annualPkg?.product?.priceString ?? '$26.00';
  const monthlyPrice = monthlyPkg?.product?.priceString ?? '$4.40';

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" />

      <View style={{
        paddingTop: insets.top + 12,
        paddingHorizontal: Spacing['2xl'],
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8, marginLeft: -8 }}>
          <Text style={{ fontSize: 22, color: C.cardAltInk, fontFamily: Fonts.sans }}>×</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onRestore}>
          <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 12, color: C.tint }}>Restore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: Spacing.xl,
          paddingBottom: insets.bottom + 200,
          paddingHorizontal: Spacing['2xl'],
          gap: Spacing.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{
          fontFamily: Fonts.serif,
          fontSize: FontSize.displayLg,
          color: C.cardAltInk,
          lineHeight: FontSize.displayLg * 1.05,
        }}>
          Ascend Plus.
        </Text>
        <Text style={{
          fontFamily: Fonts.sans,
          fontSize: FontSize.bodyLg,
          color: C.mutedAlt,
          marginBottom: Spacing.sm,
        }}>
          Everything personalized. All companions. Cloud sync. Cancel anytime.
        </Text>

        <View style={{ gap: 8, marginVertical: Spacing.base }}>
          {PERKS.map((p, i) => (
            <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text style={{ color: C.tint, fontFamily: Fonts.sansBold, fontSize: 14, marginTop: 1 }}>✓</Text>
              <Text style={{ flex: 1, fontFamily: Fonts.sans, fontSize: 14, color: C.cardAltInk, lineHeight: 20 }}>{p}</Text>
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={C.tint} style={{ marginVertical: 32 }} />
        ) : (
          <>
            <PlanCard
              selected={selectedPlan === 'annual'}
              onPress={() => setSelectedPlan('annual')}
              title="Annual"
              price={annualPrice}
              cadence="/ year"
              caption="Save 51% · ~$2.17 / month"
              badge="BEST VALUE"
              tint={C.tint}
              ink={C.cardAltInk}
              muted={C.mutedAlt}
            />
            <PlanCard
              selected={selectedPlan === 'monthly'}
              onPress={() => setSelectedPlan('monthly')}
              title="Monthly"
              price={monthlyPrice}
              cadence="/ month"
              caption="Cancel anytime in settings"
              tint={C.tint}
              ink={C.cardAltInk}
              muted={C.mutedAlt}
            />

            <TouchableOpacity
              onPress={onPurchase}
              disabled={purchasing}
              activeOpacity={0.85}
              style={{
                backgroundColor: C.tint,
                borderRadius: Radii.pill,
                paddingVertical: 16,
                alignItems: 'center',
                marginTop: Spacing.base,
                opacity: purchasing ? 0.7 : 1,
              }}
            >
              {purchasing
                ? <ActivityIndicator color={C.bg} />
                : <Text style={{ fontFamily: Fonts.sansSemiBold, fontSize: 15, color: '#1A0F4A', textTransform: 'uppercase', letterSpacing: 1 }}>
                    Continue {selectedPlan === 'annual' ? `· ${annualPrice} / yr` : `· ${monthlyPrice} / mo`}
                  </Text>
              }
            </TouchableOpacity>
          </>
        )}

        <View style={{ marginTop: Spacing.lg, gap: 6 }}>
          <Text style={{ fontFamily: Fonts.sans, fontSize: 11, color: C.mutedAlt, lineHeight: 16, textAlign: 'center' }}>
            {Platform.OS === 'ios'
              ? 'Payment is charged to your Apple ID at confirmation. Subscription renews automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel in your App Store account settings.'
              : 'Payment is charged to your Google Play account. Subscription renews automatically unless cancelled in your Google Play subscription settings before the renewal date.'}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 6 }}>
            <Text onPress={() => Linking.openURL(ENV.TERMS_URL)} style={{ fontFamily: Fonts.sansSemiBold, fontSize: 11, color: C.tint }}>
              Terms
            </Text>
            <Text onPress={() => Linking.openURL(ENV.PRIVACY_URL)} style={{ fontFamily: Fonts.sansSemiBold, fontSize: 11, color: C.tint }}>
              Privacy
            </Text>
            <Text onPress={() => Linking.openURL(ENV.EULA_URL)} style={{ fontFamily: Fonts.sansSemiBold, fontSize: 11, color: C.tint }}>
              EULA
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function PlanCard({
  selected, onPress, title, price, cadence, caption, badge, tint, ink, muted,
}: {
  selected: boolean;
  onPress: () => void;
  title: string;
  price: string;
  cadence: string;
  caption: string;
  badge?: string;
  tint: string;
  ink: string;
  muted: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={{
        borderRadius: 18,
        padding: Spacing.lg,
        backgroundColor: selected ? `${tint}1A` : 'rgba(245,244,239,0.04)',
        borderWidth: 2,
        borderColor: selected ? tint : 'rgba(245,244,239,0.1)',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <Text style={{ fontFamily: Fonts.sansBold, fontSize: 16, color: ink }}>{title}</Text>
            {badge && (
              <View style={{ backgroundColor: tint, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ fontFamily: Fonts.sansBold, fontSize: 9, color: '#1A0F4A', letterSpacing: 0.6 }}>{badge}</Text>
              </View>
            )}
          </View>
          <Text style={{ fontFamily: Fonts.sans, fontSize: 12, color: muted }}>{caption}</Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: Fonts.serif, fontSize: 22, color: ink }}>{price}</Text>
          <Text style={{ fontFamily: Fonts.mono, fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: 1 }}>{cadence}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
