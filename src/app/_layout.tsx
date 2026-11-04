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
import { setupOnlineManager } from '@/shared/lib/online-manager';
import { AppProviders } from '@/shared/providers/app-providers';

SplashScreen.preventAutoHideAsync();
setupOnlineManager();

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    NotoSans_400Regular,
    NotoSans_500Medium,
    PlusJakartaSans_400Regular_Italic,
  });

  const isReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  if (!isReady) {
    return null;
  }

  return (
    <AppProviders>
      <AppDependencies>
        <Stack screenOptions={{ headerShown: false }} />
      </AppDependencies>
    </AppProviders>
  );
}
