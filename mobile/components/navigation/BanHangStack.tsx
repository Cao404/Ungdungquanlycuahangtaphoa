import { Stack } from 'expo-router';
import Colors from '../../constants/colors';

export default function BanHangStack() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.text,
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Bán hàng' }} />
      <Stack.Screen
        name="chon-bien-the"
        options={{ title: 'Chọn biến thể', presentation: 'modal' }}
      />
    </Stack>
  );
}
