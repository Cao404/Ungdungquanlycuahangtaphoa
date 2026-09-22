import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Redirect, Stack, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { tokenConHan, useAuthStore } from '../../store/authStore';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootNavigator() {
  const token = useAuthStore((state) => state.token);
  const hydrated = useAuthStore((state) => state.hydrated);
  const segments = useSegments();
  const [fontsLoaded] = useFonts({});

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  useEffect(() => {
    if (!token) return;
    const checkExpiry = () => {
      if (!tokenConHan(token)) useAuthStore.getState().logout();
    };
    checkExpiry();
    const timer = setInterval(checkExpiry, 30_000);
    return () => clearInterval(timer);
  }, [token]);

  if (!fontsLoaded || !hydrated) return null;

  const isLoginRoute = segments[0] === 'login';
  const isProtectedRoute = segments[0] === '(tabs)';

  if (!token && isProtectedRoute) return <Redirect href="/login" />;
  if (token && isLoginRoute) return <Redirect href="/(tabs)/banhang" />;

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
