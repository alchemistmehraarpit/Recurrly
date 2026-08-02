import '@/global.css';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

// No fallback key on purpose: release builds get this injected by the build
// environment (EAS env vars / CI), so a missing value must fail loudly rather
// than silently ship someone's dev instance. See .env.example.
const injectedKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!injectedKey) {
  throw new Error('Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env');
}

// Narrowing above doesn't reach into RootLayout's closure, so re-bind it here
// instead of reaching for a non-null assertion that would defeat the check.
const publishableKey: string = injectedKey;

// Must live inside ClerkProvider so it can read the session.
function RootNavigator({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (fontsLoaded && isLoaded) {
      SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isLoaded])

  // Text must not lay out before the fonts arrive: React Native caches text
  // measurements, so widths measured against the fallback font stay put once
  // Plus Jakarta Sans loads and every label ends up clipped mid-word.
  //
  // Deliberately NOT gated on Clerk's `isLoaded`. That part is slow (SecureStore
  // + network), and unmounting the navigator through it leaves expo-router with
  // nothing to resolve the launch URL against when the OAuth redirect returns.
  // The splash screen stays up until both are ready.
  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Until Clerk resolves, `isSignedIn` is undefined and this reads as
          signed out — the splash covers that window. */}
      <Stack.Protected guard={!!isSignedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="subscriptions/[id]" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* The OAuth redirect deep-links here while the session is still settling,
          so it must stay reachable in both states. */}
      <Stack.Screen name="sso-callback" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    'sans-regular': require('../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold': require('../assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium': require('../assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold': require('../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold': require('../assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light': require('../assets/fonts/PlusJakartaSans-Light.ttf')

  })

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <RootNavigator fontsLoaded={fontsLoaded} />
    </ClerkProvider>
  );
}
