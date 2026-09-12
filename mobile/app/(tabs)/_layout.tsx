import React from 'react';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import type { ColorValue } from 'react-native';
import Colors from '../../constants/colors';

function TabIcon({ icon, color }: { icon: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 20 }}>{icon}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          borderTopColor: Colors.border,
          backgroundColor: Colors.surface,
          height: 64,
          paddingTop: 6,
          paddingBottom: 7,
        },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trang chủ',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon icon="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="catalog"
        options={{
          title: 'Sản phẩm',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon icon="▦" color={color} />,
        }}
      />
      <Tabs.Screen
        name="khuyenmai"
        options={{
          title: 'Khuyến mãi',
          tabBarIcon: ({ color }) => <TabIcon icon="%" color={color} />,
        }}
      />
      <Tabs.Screen
        name="lienhe"
        options={{
          title: 'Liên hệ',
          tabBarIcon: ({ color }) => <TabIcon icon="☎" color={color} />,
        }}
      />
      <Tabs.Screen name="banhang/index" options={{ href: null }} />
      <Tabs.Screen name="sanpham" options={{ href: null }} />
      <Tabs.Screen name="giohang" options={{ href: null }} />
      <Tabs.Screen name="lichsu" options={{ href: null }} />
    </Tabs>
  );
}
