import { Redirect, Stack, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const token = useAuthStore((s) => s.token);
  const segments = useSegments();
  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const isLoginRoute = segments[0] === 'login';
  const isTabsRoute = segments[0] === '(tabs)';

  if (!token && isTabsRoute) return <Redirect href="/login" />;
  if (token && isLoginRoute) return <Redirect href="/(tabs)/banhang" />;

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
