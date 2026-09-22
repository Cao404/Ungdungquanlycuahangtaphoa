import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import Colors from '../../constants/colors';
import Button from '../ui/Button';

export default function TaiKhoanContent() {
  const { nguoiDung, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{nguoiDung?.hoTen?.slice(0, 1).toUpperCase() ?? 'N'}</Text>
      </View>
      <Text style={styles.name}>{nguoiDung?.hoTen ?? 'Nhân viên'}</Text>
      <Text style={styles.subtitle}>{nguoiDung?.taiKhoan}</Text>

      <View style={styles.infoBox}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Vai trò</Text>
          <Text style={styles.value}>{nguoiDung?.vaiTro === 'admin' ? 'Quản trị' : 'Nhân viên'}</Text>
        </View>
        <View style={[styles.infoRow, styles.lastRow]}>
          <Text style={styles.label}>Trạng thái</Text>
          <Text style={[styles.value, styles.active]}>Đang hoạt động</Text>
        </View>
      </View>

      <Button title="Đăng xuất" variant="danger" onPress={handleLogout} style={styles.logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, alignItems: 'center', padding: 24 },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
  },
  avatarText: { color: Colors.white, fontSize: 36, fontWeight: '800' },
  name: { fontSize: 22, fontWeight: '800', color: Colors.text, marginTop: 16 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  infoBox: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginTop: 28,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  lastRow: { borderBottomWidth: 0 },
  label: { color: Colors.textSecondary, fontSize: 14 },
  value: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  active: { color: Colors.success },
  logout: { width: '100%', marginTop: 24 },
});
