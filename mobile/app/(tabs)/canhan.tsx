import React from 'react';
import { router } from 'expo-router';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/ui/Button';
import Colors from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';

export default function ProfileScreen() {
  const nguoiDung = useAuthStore((state) => state.nguoiDung);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cá nhân</Text>
        <Text style={styles.subtitle}>Thông tin tài khoản của bạn</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>👤</Text>
        </View>
        <Text style={styles.name}>{nguoiDung?.hoTen ?? 'Người dùng'}</Text>
        <Text style={styles.account}>{nguoiDung?.taiKhoan ?? 'Tài khoản xem thử'}</Text>

        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>{nguoiDung?.hoTen ?? 'Chưa cập nhật'}</Text>
          </View>
          <View style={[styles.infoRow, styles.lastRow]}>
            <Text style={styles.infoLabel}>Tài khoản</Text>
            <Text style={styles.infoValue}>{nguoiDung?.taiKhoan ?? 'Chưa cập nhật'}</Text>
          </View>
        </View>

        <Button
          title="Đăng xuất"
          variant="danger"
          size="lg"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  content: { flex: 1, alignItems: 'center', padding: 20 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
    marginTop: 24,
  },
  avatarText: { fontSize: 46 },
  name: { color: Colors.text, fontSize: 21, fontWeight: '900', marginTop: 14 },
  account: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 28,
    paddingHorizontal: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastRow: { borderBottomWidth: 0 },
  infoLabel: { color: Colors.textSecondary, fontSize: 14 },
  infoValue: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  logoutButton: { width: '100%', marginTop: 24 },
});
