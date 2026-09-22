import { router } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useKiemKe } from '../../hooks/useKiemKe';
import Colors from '../../constants/colors';
import KiemKeRow from '../KiemKeRow';
import Button from '../ui/Button';

export default function KiemKeContent() {
  const kiemKe = useKiemKe();

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/kiemke/lichsu')}>
          <Text style={styles.link}>Lịch sử phiếu ›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/taikhoan')}>
          <Text style={styles.link}>Tài khoản</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.hint}>Tồn thực tế mặc định bằng tồn hệ thống; chỉ sửa những mặt hàng bị lệch.</Text>
      <TextInput
        style={styles.search}
        placeholder="Tìm sản phẩm hoặc biến thể"
        value={kiemKe.query}
        onChangeText={kiemKe.setQuery}
        autoCorrect={false}
      />
      {kiemKe.loading && kiemKe.rows.length === 0 ? (
        <ActivityIndicator style={styles.center} color={Colors.primary} size="large" />
      ) : kiemKe.error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{kiemKe.error}</Text>
          <Button title="Thử lại" onPress={kiemKe.refetch} />
        </View>
      ) : (
        <FlatList
          data={kiemKe.rows}
          keyExtractor={(row) => String(row.bienThe.id)}
          renderItem={({ item }) => (
            <KiemKeRow
              row={item}
              value={kiemKe.counts[item.bienThe.id] ?? String(item.bienThe.soLuongTon)}
              onChangeText={(value) => kiemKe.setCount(item.bienThe.id, value)}
            />
          )}
          contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
          onRefresh={kiemKe.refetch}
          refreshing={kiemKe.loading}
          ListEmptyComponent={<Text style={styles.empty}>Không có sản phẩm phù hợp</Text>}
        />
      )}
      <View style={styles.footer}>
        <TextInput
          style={styles.note}
          placeholder="Ghi chú phiếu kiểm kê (không bắt buộc)"
          value={kiemKe.ghiChu}
          onChangeText={kiemKe.setGhiChu}
          multiline
        />
        <Button
          title={`Gửi phiếu (${kiemKe.soDongDaNhap} mặt hàng)`}
          onPress={kiemKe.guiPhieu}
          loading={kiemKe.sending}
          disabled={kiemKe.soDongDaNhap === 0 || Boolean(kiemKe.error)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 14 },
  link: { color: Colors.primary, fontWeight: '700' },
  hint: { color: Colors.textSecondary, fontSize: 13, marginHorizontal: 16, marginTop: 12 },
  search: { backgroundColor: Colors.surface, borderColor: Colors.border, borderWidth: 1, borderRadius: 10, margin: 16, paddingHorizontal: 14, paddingVertical: 10 },
  list: { paddingHorizontal: 16, paddingBottom: 16, flexGrow: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 },
  error: { color: Colors.danger, textAlign: 'center' },
  empty: { color: Colors.textMuted, textAlign: 'center', marginTop: 50 },
  footer: { backgroundColor: Colors.surface, borderTopWidth: 1, borderTopColor: Colors.border, padding: 14, gap: 10 },
  note: { borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 10, minHeight: 42 },
});
