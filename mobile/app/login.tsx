import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Colors from '../constants/colors';
import { APP_NAME } from '../constants/config';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');

  const handleLogin = async () => {
    const ok = await login(taiKhoan.trim(), matKhau);
    if (ok) router.replace('/(tabs)/banhang');
  };

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
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Đăng nhập" onPress={handleLogin} loading={loading} size="lg" />
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
  error: { color: Colors.danger, fontSize: 13, textAlign: 'center' },
});
