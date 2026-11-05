import { NotoSans_400Regular, NotoSans_500Medium } from '@expo-google-fonts/noto-sans';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_400Regular_Italic,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

import { AppDependencies } from '@/di/app-dependencies';
import { useSession } from '@/features/auth/session/session-provider';
import { setupOnlineManager } from '@/shared/lib/online-manager';
import { AppProviders } from '@/shared/providers/app-providers';

SplashScreen.preventAutoHideAsync();
setupOnlineManager();

function RootNavigator() {
  const session = useSession();
  const isSessionResolved = session.status !== 'loading';
  const isSignedIn = session.status === 'signed-in';

  useEffect(() => {
    if (isSessionResolved) {
      SplashScreen.hideAsync();
    }
  }, [isSessionResolved]);

  if (!isSessionResolved) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={isSignedIn}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="word/[word]" />
      </Stack.Protected>

      <Stack.Protected guard={!isSignedIn}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_400Regular_Italic,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    NotoSans_400Regular,
    NotoSans_500Medium,
  });

  if (!fontsLoaded && fontError === null) {
    return null;
  }

  return (
    <AppProviders>
      <AppDependencies>
        <RootNavigator />
      </AppDependencies>
    </AppProviders>
  );
}
