import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../store/authStore';
import { GioHangProvider } from '../store/gioHangStore';

export default function RootLayout() {
  return (
    <AuthProvider>
      <GioHangProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </GioHangProvider>
    </AuthProvider>
  );
}
