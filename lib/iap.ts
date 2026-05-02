import { Platform } from 'react-native';
import Purchases, {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
  LOG_LEVEL,
} from 'react-native-purchases';
import { ENV } from './env';
import { supabase } from './supabase';

export const ENTITLEMENT_ID = 'ascend_plus';

let _initialized = false;

export async function initIAP(supabaseUserId: string | null): Promise<void> {
  if (_initialized) {
    if (supabaseUserId) await Purchases.logIn(supabaseUserId);
    return;
  }
  const key = ENV.REVENUECAT_KEY;
  if (!key) {
    if (__DEV__) console.warn('[iap] No RevenueCat key configured for this platform');
    return;
  }
  try {
    if (__DEV__) await Purchases.setLogLevel(LOG_LEVEL.WARN);
    await Purchases.configure({
      apiKey: key,
      appUserID: supabaseUserId ?? undefined,
    });
    _initialized = true;
  } catch (err) {
    if (__DEV__) console.warn('[iap] Failed to initialize RevenueCat', err);
  }
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  if (!_initialized) return null;
  try {
    const o = await Purchases.getOfferings();
    return o.current ?? null;
  } catch {
    return null;
  }
}

export interface IapPurchaseResult {
  success: boolean;
  error?: string;
  cancelled?: boolean;
  customerInfo?: CustomerInfo;
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<IapPurchaseResult> {
  if (!_initialized) return { success: false, error: 'IAP not initialized' };
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const isPlus = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    if (isPlus) await syncEntitlementToSupabase('ascend_plus');
    return { success: isPlus, customerInfo };
  } catch (err: any) {
    const cancelled = err?.userCancelled === true;
    return { success: false, cancelled, error: err?.message ?? 'Purchase failed' };
  }
}

export async function restorePurchases(): Promise<IapPurchaseResult> {
  if (!_initialized) return { success: false, error: 'IAP not initialized' };
  try {
    const customerInfo = await Purchases.restorePurchases();
    const isPlus = !!customerInfo.entitlements.active[ENTITLEMENT_ID];
    if (isPlus) await syncEntitlementToSupabase('ascend_plus');
    return { success: isPlus, customerInfo };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Restore failed' };
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo | null> {
  if (!_initialized) return null;
  try {
    return await Purchases.getCustomerInfo();
  } catch {
    return null;
  }
}

async function syncEntitlementToSupabase(entitlement: 'free' | 'ascend_plus' | 'ascend_plus_lifetime') {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    await supabase
      .from('profiles')
      .update({ entitlement })
      .eq('user_id', u.user.id);
  } catch {}
}

export async function logOutIAP(): Promise<void> {
  if (!_initialized) return;
  try { await Purchases.logOut(); } catch {}
}

export const PLATFORM_PRICE_DISPLAY = Platform.select({
  ios: '$4.40 / month or $26.00 / year',
  android: '$4.40 / month or $26.00 / year',
  default: '$4.40 / month or $26.00 / year',
});
