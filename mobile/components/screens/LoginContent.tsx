import { router } from 'expo-router';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useLoginForm } from '../../hooks/useAuth';
import { APP_NAME } from '../../constants/config';
import Colors from '../../constants/colors';
import Button from '../ui/Button';

export default function LoginContent() {
  const form = useLoginForm();

  const handleLogin = async () => {
    if (await form.submit()) router.replace('/(tabs)/banhang');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.logo}>🏪</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>Đăng nhập để bắt đầu bán hàng</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Tài khoản"
            value={form.taiKhoan}
            onChangeText={form.setTaiKhoan}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={form.matKhau}
            onChangeText={form.setMatKhau}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          {form.error && <Text style={styles.error}>{form.error}</Text>}
          <Button title="Đăng nhập" onPress={handleLogin} loading={form.loading} size="lg" />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 28, backgroundColor: Colors.background },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, marginTop: 4 },
  form: { gap: 14 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.text,
  },
  error: { color: Colors.danger, fontSize: 13, textAlign: 'center' },
});
