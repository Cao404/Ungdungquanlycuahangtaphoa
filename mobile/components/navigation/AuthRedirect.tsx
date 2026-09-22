import { Redirect } from 'expo-router';
import { useAuthStore } from '../../store/authStore';

export default function AuthRedirect() {
  const token = useAuthStore((state) => state.token);
  return token ? <Redirect href="/(tabs)/banhang" /> : <Redirect href="/login" />;
}
