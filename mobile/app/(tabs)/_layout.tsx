import React, { useEffect } from 'react';
import { router, Tabs, usePathname } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import type { ColorValue } from 'react-native';
import Colors from '../../constants/colors';

type TabIconName = 'home' | 'inbox' | 'contact' | 'profile';

function TabIcon({ name, color }: { name: TabIconName; color: ColorValue }) {
  if (name === 'inbox') {
    return (
      <View style={styles.tabIconBox}>
        <View style={[styles.messageIcon, { borderColor: color }]}>
          <View style={[styles.messageTail, { borderColor: color }]} />
        </View>
      </View>
    );
  }

  if (name === 'profile') {
    return (
      <View style={styles.profileIcon}>
        <View style={[styles.profileHead, { borderColor: color }]} />
        <View style={[styles.profileBody, { borderColor: color }]} />
      </View>
    );
  }

  return (
    <Text style={[styles.textIcon, { color }]}>
      {name === 'home' ? '⌂' : '✆'}
    </Text>
  );
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
          tabBarIcon: ({ color }) => <TabIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="hopthu"
        options={{
          title: 'Hộp thư',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon name="inbox" color={color} />,
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Liên hệ',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon name="contact" color={color} />,
        }}
      />
      <Tabs.Screen
        name="canhan"
        options={{
          title: 'Cá nhân',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} />,
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
      <Tabs.Screen name="sanpham" options={{ href: null, headerShown: false }} />
      <Tabs.Screen name="khuyenmai" options={{ href: null }} />
      <Tabs.Screen name="banhang/index" options={{ href: null }} />
      <Tabs.Screen name="banhang/chon-bien-the" options={{ href: null }} />
      <Tabs.Screen name="catalog" options={{ href: null }} />
      <Tabs.Screen name="lienhe" options={{ href: null }} />
      <Tabs.Screen name="giohang" options={{ href: null }} />
      <Tabs.Screen name="lichsu" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabIconBox: { width: 28, height: 27, alignItems: 'center', justifyContent: 'center' },
  textIcon: { fontSize: 24, lineHeight: 26 },
  messageIcon: {
    width: 23,
    height: 17,
    borderWidth: 2,
    borderRadius: 4,
  },
  messageTail: {
    position: 'absolute',
    left: 4,
    bottom: -5,
    width: 8,
    height: 8,
    backgroundColor: Colors.surface,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: '-45deg' }],
  },
  profileIcon: { width: 28, height: 27, alignItems: 'center', justifyContent: 'center' },
  profileHead: { width: 10, height: 10, borderWidth: 2, borderRadius: 5, marginBottom: 2 },
  profileBody: {
    width: 24,
    height: 11,
    borderWidth: 2,
    borderBottomWidth: 0,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
});
