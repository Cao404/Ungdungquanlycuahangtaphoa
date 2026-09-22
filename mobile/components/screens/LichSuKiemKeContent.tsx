import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { useLichSuKiemKe } from '../../hooks/useKiemKe';
import { TrangThaiKiemKe } from '../../types/KiemKe';
import Colors from '../../constants/colors';
import Button from '../ui/Button';

const statusLabels: Record<TrangThaiKiemKe, string> = {
  cho_duyet: 'Chờ duyệt',
  da_duyet: 'Đã duyệt',
  tu_choi: 'Từ chối',
};

export default function LichSuKiemKeContent() {
  const history = useLichSuKiemKe();

  if (history.loading && history.phieu.length === 0) {
    return <ActivityIndicator style={styles.center} color={Colors.primary} size="large" />;
  }
  if (history.error) return (
    <View style={styles.center}>
      <Text style={styles.error}>{history.error}</Text>
      <Button title="Thử lại" onPress={history.refetch} />
    </View>
  );

  return (
    <FlatList
      data={history.phieu}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      onRefresh={history.refetch}
      refreshing={history.loading}
      ListEmptyComponent={<Text style={styles.empty}>Bạn chưa gửi phiếu kiểm kê nào</Text>}
      renderItem={({ item }) => (
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Phiếu #{String(item.id).padStart(6, '0')}</Text>
              <Text style={styles.muted}>{new Date(item.ngayTao).toLocaleString('vi-VN')}</Text>
            </View>
            <Text style={[styles.status, item.trangThai === 'da_duyet' && styles.approved, item.trangThai === 'tu_choi' && styles.rejected]}>
              {statusLabels[item.trangThai] ?? item.trangThai}
            </Text>
          </View>
          {item.ghiChu ? <Text style={styles.note}>{item.ghiChu}</Text> : null}
          {item.lyDoTuChoi ? <Text style={styles.rejected}>Lý do: {item.lyDoTuChoi}</Text> : null}
          {item.chiTiet.map((line) => (
            <View key={line.id} style={styles.line}>
              <Text style={styles.product}>
                {line.bienThe?.sanPham.ten ?? `Biến thể #${line.bienTheId}`}
                {line.bienThe ? ` · ${Number(line.bienThe.giaTri).toLocaleString('vi-VN')} ${line.bienThe.donVi}` : ''}
              </Text>
              <Text style={styles.muted}>Hệ thống {line.soLuongHeThong} → Thực tế {line.soLuongThucTe} ({line.chenhLech > 0 ? '+' : ''}{line.chenhLech})</Text>
            </View>
          ))}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  list: { padding: 16, flexGrow: 1 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, marginBottom: 12, gap: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  status: { color: '#B45309', fontWeight: '700' },
  approved: { color: Colors.success },
  rejected: { color: Colors.danger },
  muted: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 },
  note: { color: Colors.textSecondary },
  line: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8 },
  product: { color: Colors.text, fontWeight: '600' },
  error: { color: Colors.danger, textAlign: 'center' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 50 },
});
