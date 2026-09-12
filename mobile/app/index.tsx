import { Redirect } from 'expo-router';
import { useAuthStore } from '../store/authStore';

// Redirect dựa trên trạng thái đăng nhập
export default function Index() {
  const token = useAuthStore((s) => s.token);
  return token
    ? <Redirect href="/(tabs)/banhang" />
    : <Redirect href="/login" />;
}
