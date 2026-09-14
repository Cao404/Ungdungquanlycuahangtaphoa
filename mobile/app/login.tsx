import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import Button from '../components/ui/Button';
import Colors from '../constants/colors';
import { APP_NAME } from '../constants/config';

export default function LoginScreen() {
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');

  // chế độ xem thử giao diện: bỏ qua xác thực backend.
  const handleLogin = () => router.replace('/(tabs)');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.logo}>🏪</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.sub}>Đăng nhập để bắt đầu bán hàng</Text>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Tài khoản"
            value={taiKhoan}
            onChangeText={setTaiKhoan}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <TextInput
            style={styles.input}
            placeholder="Mật khẩu"
            value={matKhau}
            onChangeText={setMatKhau}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <Button title="Đăng nhập" onPress={handleLogin} size="lg" />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push('/register')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 28, backgroundColor: Colors.background },
  logo:  { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  sub:   { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, marginTop: 4 },
  form:  { gap: 14 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: Colors.text,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8 },
  footerText: { color: Colors.textSecondary, fontSize: 14 },
  footerLink: { color: Colors.primary, fontSize: 14, fontWeight: '700' },
});
