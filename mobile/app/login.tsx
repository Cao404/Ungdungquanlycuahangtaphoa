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
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login, loading, error } = useAuth();
  const [taiKhoan, setTaiKhoan] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
        <View style={styles.logo}><Ionicons name="storefront" color={Colors.white} size={30} /></View>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.sub}>Đăng nhập để bắt đầu bán hàng</Text>

        <View style={styles.form}>
          <Text style={styles.label}>Tài khoản</Text>
          <TextInput
            style={styles.input}
            placeholder="Nhập tài khoản"
            value={taiKhoan}
            onChangeText={setTaiKhoan}
            autoCapitalize="none"
            returnKeyType="next"
          />
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.passwordRow}><TextInput style={styles.passwordInput} placeholder="Nhập mật khẩu" value={matKhau} onChangeText={setMatKhau} secureTextEntry={!showPassword} returnKeyType="done" onSubmitEditing={handleLogin} /><Ionicons.Button name={showPassword ? 'eye-off-outline' : 'eye-outline'} backgroundColor="transparent" color={Colors.textSecondary} underlayColor="transparent" onPress={() => setShowPassword((value) => !value)} /></View>
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Đăng nhập" onPress={handleLogin} loading={loading} size="lg" />
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 28, backgroundColor: Colors.background },
  logo:  { width: 62, height: 62, borderRadius: 18, backgroundColor: Colors.primary, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, textAlign: 'center' },
  sub:   { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginBottom: 32, marginTop: 4 },
  form:  { gap: 14 },
  label: { fontWeight: '800', color: Colors.text, marginBottom: -7 },
  input: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border,
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 15, color: Colors.text,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, paddingLeft: 16 },
  passwordInput: { flex: 1, paddingVertical: 13, fontSize: 15, color: Colors.text },
  error: { color: Colors.danger, fontSize: 13, textAlign: 'center' },
});
