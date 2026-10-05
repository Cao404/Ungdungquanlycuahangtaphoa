import React from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import GioHangItemComp from '../../components/GioHangItem';
import Button from '../../components/ui/Button';
import Colors from '../../constants/colors';
import { useGioHang } from '../../hooks/useGioHang';

export default function GioHangScreen() {
  const { items, capNhat, xoa, xoaHet, tongTien, soMon } = useGioHang();
  const clear = () => Alert.alert('Xóa giỏ hàng?', 'Toàn bộ sản phẩm đã chọn sẽ bị xóa.', [
    { text: 'Giữ lại', style: 'cancel' },
    { text: 'Xóa', style: 'destructive', onPress: xoaHet },
  ]);

  if (!items.length) return <View style={styles.empty}>
    <View style={styles.emptyIcon}><Ionicons name="basket-outline" size={30} color={Colors.primary} /></View>
    <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
    <Text style={styles.emptyText}>Quét mã vạch hoặc chọn sản phẩm để bắt đầu đơn hàng.</Text>
    <Button title="Chọn sản phẩm" onPress={() => router.replace('/(tabs)/banhang')} />
  </View>;

  return <View style={styles.page}>
    <View style={styles.heading}>
      <View><Text style={styles.title}>Đơn hàng hiện tại</Text><Text style={styles.subtitle}>{soMon} sản phẩm đã chọn</Text></View>
      <Button title="Xóa hết" size="sm" variant="ghost" onPress={clear} />
    </View>
    <FlatList data={items} keyExtractor={(item) => item.bienTheId} contentContainerStyle={styles.list}
      renderItem={({ item }) => <GioHangItemComp item={item}
        onTang={() => { if (!capNhat(item.bienTheId, item.soLuong + 1)) Alert.alert('Không đủ tồn kho', `Chỉ còn ${item.tonKho} sản phẩm.`); }}
        onGiam={() => capNhat(item.bienTheId, item.soLuong - 1)} onXoa={() => xoa(item.bienTheId)} />} />
    <View style={styles.footer}>
      <View><Text style={styles.totalLabel}>Tạm tính</Text><Text style={styles.totalHint}>Giá chính xác được kiểm tra lại ở bước sau</Text></View>
      <Text style={styles.total}>{tongTien.toLocaleString('vi-VN')}đ</Text>
      <Button title="Tiếp tục thanh toán" size="lg" onPress={() => router.push('/payment')} />
    </View>
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background },
  heading: { padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text }, subtitle: { marginTop: 3, color: Colors.textSecondary },
  list: { paddingBottom: 12 },
  footer: { gap: 10, padding: 18, borderTopWidth: 1, borderTopColor: Colors.border, backgroundColor: Colors.surface },
  totalLabel: { color: Colors.textSecondary, fontWeight: '700' }, totalHint: { marginTop: 2, color: Colors.textMuted, fontSize: 12 },
  total: { fontSize: 28, fontWeight: '900', color: Colors.primary },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySoft },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 18 },
  emptyText: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, marginTop: 7, marginBottom: 22 },
});
