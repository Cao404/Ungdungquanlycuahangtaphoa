import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useLichSuHoaDon } from '../../hooks/useLichSuHoaDon';
import { HoaDon } from '../../types/HoaDon';
import Colors from '../../constants/colors';

const paymentLabels: Record<HoaDon['hinhThucTT'], string> = {
  tienmat: 'Tiền mặt',
  chuyenkhoan: 'Chuyển khoản',
};

export default function LichSuContent() {
  const history = useLichSuHoaDon();

  if (history.loading && history.hoaDons.length === 0) {
    return <ActivityIndicator style={styles.loading} color={Colors.primary} size="large" />;
  }
  if (history.error) return <Text style={styles.error}>{history.error}</Text>;

  return (
    <FlatList
      ListHeaderComponent={
        <View style={styles.filters}>
          <TextInput style={styles.dateInput} placeholder="Từ: YYYY-MM-DD" value={history.tu} onChangeText={history.setTu} keyboardType="numbers-and-punctuation" />
          <TextInput style={styles.dateInput} placeholder="Đến: YYYY-MM-DD" value={history.den} onChangeText={history.setDen} keyboardType="numbers-and-punctuation" />
          <TouchableOpacity style={styles.filterButton} onPress={history.applyFilter}><Text style={styles.filterLabel}>Lọc</Text></TouchableOpacity>
          {history.filterError ? <Text style={styles.error}>{history.filterError}</Text> : null}
        </View>
      }
      data={history.hoaDons}
      keyExtractor={(item) => String(item.id)}
      contentContainerStyle={styles.list}
      onRefresh={history.refetch}
      refreshing={history.loading}
      ListEmptyComponent={<Text style={styles.empty}>Bạn chưa có hóa đơn nào</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push({ pathname: '/(tabs)/lichsu/[id]', params: { id: String(item.id) } })}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.invoiceId}>Hóa đơn #{String(item.id).padStart(6, '0')}</Text>
            <Text style={styles.date}>{new Date(item.ngayBan).toLocaleString('vi-VN')}</Text>
            <Text style={styles.payment}>{paymentLabels[item.hinhThucTT]}</Text>
          </View>
          <Text style={styles.total}>{item.tongTien.toLocaleString('vi-VN')}đ  ›</Text>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  dateInput: { flexGrow: 1, minWidth: 120, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 8 },
  filterButton: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 18, justifyContent: 'center' },
  filterLabel: { color: Colors.white, fontWeight: '700' },
  loading: { flex: 1 },
  list: { padding: 12, flexGrow: 1 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invoiceId: { fontWeight: '700', fontSize: 14, color: Colors.text },
  date: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },
  payment: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  total: { fontWeight: '800', fontSize: 15, color: Colors.primary },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 15 },
  error: { textAlign: 'center', color: Colors.danger, marginTop: 40 },
});
