import { Redirect } from 'expo-router';
import { useStore } from '../lib/store';

export default function Index() {
  const onboardingComplete = useStore((s: { onboardingComplete: boolean }) => s.onboardingComplete);
  if (onboardingComplete) {
    return <Redirect href="/(tabs)/home" />;
  }
  return <Redirect href="/(onboarding)/welcome" />;
}
