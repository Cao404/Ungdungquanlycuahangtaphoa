import React from 'react';
import { Tabs } from 'expo-router';
import { useGioHang } from '../../hooks/useGioHang';
import Colors from '../../constants/colors';

export default function TabsLayout() {
  const { soLuongTong } = useGioHang();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { borderTopColor: Colors.border },
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
      }}
    >
      <Tabs.Screen
        name="banhang/index"
        options={{ title: 'Bán hàng', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="giohang"
        options={{
          title: 'Giỏ hàng',
          tabBarBadge: soLuongTong > 0 ? soLuongTong : undefined,
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="lichsu"
        options={{ title: 'Lịch sử', tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
