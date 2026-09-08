import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

export default function Index() {
  const { state } = useAuth();
  return state.nguoiDung
    ? <Redirect href="/(tabs)/banhang" />
    : <Redirect href="/login" />;
}
