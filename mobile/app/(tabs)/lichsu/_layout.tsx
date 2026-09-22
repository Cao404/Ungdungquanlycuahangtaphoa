import { Stack } from 'expo-router';
import Colors from '../../../constants/colors';

export default function LichSuLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.text }}>
      <Stack.Screen name="index" options={{ title: 'Lịch sử hóa đơn' }} />
      <Stack.Screen name="[id]" options={{ title: 'Chi tiết hóa đơn' }} />
    </Stack>
  );
}
