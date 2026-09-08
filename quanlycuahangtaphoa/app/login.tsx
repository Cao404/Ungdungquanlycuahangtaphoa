import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/ui/Button';
import Colors from '../constants/colors';
import { APP_NAME } from '../constants/config';

export default function LoginScreen() {
  const { dangNhap, state } = useAuth();
  const [tenDangNhap, setTen] = useState('');
  const [matKhau, setMk] = useState('');

  const handleLogin = async () => {
    await dangNhap(tenDangNhap, matKhau);
    if (!state.loi) router.replace('/(tabs)/banhang');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>{APP_NAME}</Text>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Tên đăng nhập"
          value={tenDangNhap}
          onChangeText={setTen}
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Mật khẩu"
          value={matKhau}
          onChangeText={setMk}
          secureTextEntry
        />
        {state.loi && <Text style={styles.loi}>{state.loi}</Text>}
        <Button title="Đăng nhập" onPress={handleLogin} loading={state.dangTai} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: Colors.background },
  title: { fontSize: 22, fontWeight: '700', color: Colors.text, textAlign: 'center', marginBottom: 32 },
  form: { gap: 14 },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1, borderColor: Colors.border,
    borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.text,
  },
  loi: { color: Colors.danger, fontSize: 13, textAlign: 'center' },
});
