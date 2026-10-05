import React from 'react';
import type { ColorValue } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';

export default function TabsLayout() {
  const icon = (name: keyof typeof Ionicons.glyphMap) => ({ color, size }: { color: ColorValue; size: number }) => <Ionicons name={name} color={color} size={size} />;
  return <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: Colors.primary, tabBarInactiveTintColor: Colors.textMuted, tabBarStyle: { height: 64, paddingTop: 6, borderTopColor: Colors.border, backgroundColor: Colors.surface }, tabBarLabelStyle: { fontSize: 11, fontWeight: '700' } }}>
    <Tabs.Screen name="banhang/index" options={{ title: 'Bán hàng', tabBarIcon: icon('storefront-outline') }} />
    <Tabs.Screen name="lichsu" options={{ title: 'Hóa đơn', tabBarIcon: icon('receipt-outline') }} />
    <Tabs.Screen name="taikhoan" options={{ title: 'Cá nhân', tabBarIcon: icon('person-outline') }} />
    <Tabs.Screen name="giohang" options={{ href: null, title: 'Giỏ hàng' }} />
    <Tabs.Screen name="banhang/chon-bien-the" options={{ href: null, title: 'Chọn loại' }} />
  </Tabs>;
}
