import { Stack } from 'expo-router';
import Colors from '../../../constants/colors';

export default function KiemKeLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }}>
      <Stack.Screen name="index" options={{ title: 'Kiểm kê' }} />
      <Stack.Screen name="lichsu" options={{ title: 'Lịch sử kiểm kê' }} />
    </Stack>
  );
}
