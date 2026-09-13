import React, { useEffect } from 'react';
import { router, Tabs, usePathname } from 'expo-router';
import { Text } from 'react-native';
import type { ColorValue } from 'react-native';
import Colors from '../../constants/colors';

function TabIcon({ icon, color }: { icon: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 20 }}>{icon}</Text>;
}

export default function TabsLayout() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === '/') {
      router.replace('/(tabs)/homepage');
      return;
    }

    if (pathname.endsWith('/lienhe')) {
      router.replace('/(tabs)/contact');
    }
  }, [pathname]);

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
        name="homepage"
        options={{
          title: 'Trang chủ',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon icon="⌂" color={color} />,
        }}
      />
      <Tabs.Screen
        name="sanpham"
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
        name="contact"
        options={{
          title: 'Liên hệ',
          tabBarIcon: ({ color }) => <TabIcon icon="☎" color={color} />,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="banhang/index" options={{ href: null }} />
      <Tabs.Screen name="banhang/chon-bien-the" options={{ href: null }} />
      <Tabs.Screen name="catalog" options={{ href: null }} />
      <Tabs.Screen name="lienhe" options={{ href: null }} />
      <Tabs.Screen name="giohang" options={{ href: null }} />
      <Tabs.Screen name="lichsu" options={{ href: null }} />
    </Tabs>
  );
}
