import React from 'react';
import { Tabs } from 'expo-router';
import { useGioHangStore } from '../../store/gioHangStore';
import Colors from '../../constants/colors';

export default function TabsLayout() {
  const soMon = useGioHangStore((s) => s.soMon());

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { borderTopColor: Colors.border, backgroundColor: Colors.surface },
        tabBarLabelStyle: { fontWeight: '600', fontSize: 11 },
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Tabs.Screen
        name="banhang/index"
        options={{ title: 'Bán hàng', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="banhang/chon-bien-the"
        options={{ href: null, title: 'Chọn biến thể' }}
      />
      <Tabs.Screen
        name="giohang"
        options={{
          title: 'Giỏ hàng',
          tabBarBadge: soMon > 0 ? soMon : undefined,
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="lichsu"
        options={{ title: 'Lịch sử', tabBarIcon: () => null }}
      />
      <Tabs.Screen
        name="taikhoan"
        options={{ title: 'Tài khoản', tabBarIcon: () => null }}
      />
    </Tabs>
  );
}
