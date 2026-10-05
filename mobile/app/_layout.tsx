import { Redirect, Stack, useSegments } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/auth.service';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrate = useAuthStore((s) => s.hydrate);
  const segments = useSegments();
  const [fontsLoaded] = useFonts({});
  const [sessionChecked, setSessionChecked] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);
  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => {
    if (!hydrated) return;
    if (!token) { setSessionChecked(true); return; }
    setSessionChecked(false);
    authService.me().then((user) => setAuth(token, user)).catch(() => undefined).finally(() => setSessionChecked(true));
  }, [hydrated, token, setAuth]);

  if (!fontsLoaded || !hydrated || !sessionChecked) return <View style={styles.loading}><ActivityIndicator /></View>;

  const isLoginRoute = segments[0] === 'login';
  const isPublicRoute = isLoginRoute || segments[0] === 'index';

  // Scanner and remote scanner are private child screens too. No private route
  // can be opened before a stored session has hydrated and authenticated.
  if (!token && !isPublicRoute) return <Redirect href="/login" />;
  if (token && isLoginRoute) return <Redirect href="/(tabs)/banhang" />;

  return (
    <GestureHandlerRootView style={styles.root}>
      <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="scanner" options={{ presentation: 'modal', headerShown: true, title: 'Quét mã vạch' }} />
        <Stack.Screen name="remote-scanner" options={{ presentation: 'modal', headerShown: true, title: 'Máy quét từ xa' }} />
        <Stack.Screen name="payment" options={{ headerShown: true, title: 'Thanh toán' }} />
        <Stack.Screen name="payment-success" options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="invoice/[id]" options={{ headerShown: true, title: 'Chi tiết hóa đơn' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 }, loading: { flex: 1, alignItems: 'center', justifyContent: 'center' } });
