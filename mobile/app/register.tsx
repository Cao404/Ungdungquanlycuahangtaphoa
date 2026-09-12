import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Button from '../components/ui/Button';
import Colors from '../constants/colors';
import { APP_NAME } from '../constants/config';
import { useAuth } from '../hooks/useAuth';

export default function RegisterScreen() {
  const { register, loading, error } = useAuth();
  const [hoTen, setHoTen] = useState('');
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [xacNhanMatKhau, setXacNhanMatKhau] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleRegister = async () => {
    const hoTenDaTrim = hoTen.trim();
    const taiKhoanDaTrim = taiKhoan.trim();

    if (!hoTenDaTrim || !taiKhoanDaTrim || !matKhau || !xacNhanMatKhau) {
      setFormError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    if (taiKhoanDaTrim.length < 3) {
      setFormError('Tài khoản phải có ít nhất 3 ký tự');
      return;
    }
    if (matKhau.length < 6) {
      setFormError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (matKhau !== xacNhanMatKhau) {
      setFormError('Mật khẩu xác nhận không khớp');
      return;
    }

    setFormError(null);
    const ok = await register(hoTenDaTrim, taiKhoanDaTrim, matKhau);
    if (ok) {
      Alert.alert(
        'Đăng ký thành công',
        'Bạn có thể đăng nhập bằng tài khoản vừa tạo.',
        [{ text: 'Đăng nhập', onPress: () => router.replace('/login') }],
      );
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.logo}>🏪</Text>
          <Text style={styles.title}>{APP_NAME}</Text>
          <Text style={styles.sub}>Đăng ký tài khoản để bắt đầu bán hàng</Text>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Họ và tên"
              value={hoTen}
              onChangeText={setHoTen}
              autoComplete="name"
              textContentType="name"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Tài khoản"
              value={taiKhoan}
              onChangeText={setTaiKhoan}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username-new"
              textContentType="username"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              value={matKhau}
              onChangeText={setMatKhau}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu"
              value={xacNhanMatKhau}
              onChangeText={setXacNhanMatKhau}
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />

            {(formError || error) && (
              <Text style={styles.error}>{formError ?? error}</Text>
            )}

            <Button
              title="Đăng ký"
              onPress={handleRegister}
              loading={loading}
              size="lg"
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.replace('/login')} activeOpacity={0.7}>
                <Text style={styles.footerLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flexGrow: 1, justifyContent: 'center', padding: 28, paddingVertical: 36 },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  sub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 4,
  },
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
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
