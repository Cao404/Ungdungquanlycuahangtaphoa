import { Text } from 'react-native';
import { Tabs } from 'expo-router';
import { useGioHangStore } from '../../store/gioHangStore';
import Colors from '../../constants/colors';

const TabIcon = ({ icon }: { icon: string }) => <Text style={{ fontSize: 18 }}>{icon}</Text>;

export default function MainTabs() {
  const soMon = useGioHangStore((state) => state.soMon());

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
        name="banhang"
        options={{ title: 'Bán hàng', headerShown: false, tabBarIcon: () => <TabIcon icon="🏪" /> }}
      />
      <Tabs.Screen
        name="giohang"
        options={{
          title: 'Giỏ hàng',
          tabBarBadge: soMon > 0 ? soMon : undefined,
          tabBarIcon: () => <TabIcon icon="🛒" />,
        }}
      />
      <Tabs.Screen
        name="lichsu"
        options={{ title: 'Lịch sử', headerShown: false, tabBarIcon: () => <TabIcon icon="🧾" /> }}
      />
      <Tabs.Screen
        name="kiemke"
        options={{ title: 'Kiểm kê', headerShown: false, tabBarIcon: () => <TabIcon icon="📋" /> }}
      />
      <Tabs.Screen name="taikhoan" options={{ href: null }} />
    </Tabs>
  );
}
