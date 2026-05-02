import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts,
  InstrumentSerif_400Regular,
  InstrumentSerif_400Regular_Italic,
} from '@expo-google-fonts/instrument-serif';
import {
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
} from '@expo-google-fonts/geist';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';
import { useStore, loadState, AppState } from '../lib/store';
import { useColors } from '../lib/theme';
import { Colors } from '../theme/tokens';
import { useAuthSession } from '../lib/auth';
import { initIAP, logOutIAP } from '../lib/iap';
import { initSentry, setSentryUser } from '../lib/sentry';
import '../global.css';

initSentry();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const onboardingComplete = useStore((s: { onboardingComplete: boolean }) => s.onboardingComplete);
  const [hydrated, setHydrated] = useState(false);
  const { session, loading: authLoading } = useAuthSession();

  useEffect(() => {
    loadState().then(saved => {
      if (saved) {
        const { getState, setState } = useStore;
        setState({ ...getState(), ...saved } as AppState);
      }
      setHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    if (session?.user?.id) {
      initIAP(session.user.id).catch(() => {});
      setSentryUser(session.user.id);
    } else {
      initIAP(null).catch(() => {});
      logOutIAP().catch(() => {});
      setSentryUser(null);
    }
  }, [hydrated, authLoading, session?.user?.id]);

  useEffect(() => {
    if (!hydrated || authLoading) return;
    const seg0 = segments[0] as string | undefined;
    const inAuth = seg0 === '(auth)';
    const inOnboarding = seg0 === '(onboarding)';
    const inTabs = seg0 === '(tabs)';

    // No session and no existing local data → require sign in (or guest path from auth screen)
    if (!session && !onboardingComplete && !inAuth && !inOnboarding) {
      router.replace('/(auth)/signin' as any);
      return;
    }

    // Signed in + not onboarded → go to onboarding
    if (session && !onboardingComplete && !inOnboarding) {
      router.replace('/(onboarding)/welcome' as any);
      return;
    }

    // Signed in or already-onboarded local user, but currently in auth/onboarding → exit to tabs
    if (onboardingComplete && (inAuth || inOnboarding)) {
      router.replace('/(tabs)/home' as any);
      return;
    }

    // Original guard: trying to enter tabs without finishing onboarding
    if (!onboardingComplete && inTabs) {
      router.replace('/(onboarding)/welcome' as any);
    }
  }, [hydrated, authLoading, session?.user?.id, onboardingComplete, segments.join('/')]);

  if (!hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const C = useColors();
  const [fontsLoaded, fontError] = useFonts({
    InstrumentSerif_400Regular,
    InstrumentSerif_400Regular_Italic,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: C.bg } }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="aspect/[id]"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="settings"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="book-reader"
              options={{ animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="paywall"
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </Stack>
        </AuthGuard>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
