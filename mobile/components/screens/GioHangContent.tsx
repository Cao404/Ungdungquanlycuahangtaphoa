import { router } from 'expo-router';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useThanhToan } from '../../hooks/useGioHang';
import { HinhThucTT } from '../../types/HoaDon';
import Colors from '../../constants/colors';
import GioHangItem from '../GioHangItem';
import Button from '../ui/Button';

const PAYMENT_METHODS: { key: HinhThucTT; label: string }[] = [
  { key: 'tienmat', label: '💵 Tiền mặt' },
  { key: 'chuyenkhoan', label: '📲 Chuyển khoản' },
];

export default function GioHangContent() {
  const checkout = useThanhToan();

  if (checkout.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyText}>Giỏ hàng trống</Text>
        <Button
          title="Chọn sản phẩm"
          variant="outline"
          onPress={() => router.replace('/(tabs)/banhang')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={checkout.items}
        keyExtractor={(item) => String(item.bienTheId)}
        renderItem={({ item }) => (
          <GioHangItem
            item={item}
            onTang={() => checkout.capNhat(item.bienTheId, item.soLuong + 1)}
            onGiam={() => checkout.capNhat(item.bienTheId, item.soLuong - 1)}
            onXoa={() => checkout.xoa(item.bienTheId)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>{checkout.soMon} món</Text>
          <Text style={styles.total}>{checkout.tongTien.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.buttonRow}>
          <Button title="Xóa hết" variant="ghost" onPress={checkout.xoaHet} />
          <Button title="Thanh toán" onPress={checkout.moThanhToan} style={styles.checkoutButton} />
        </View>
      </View>

      <Modal
        visible={checkout.showModal}
        transparent
        animationType="slide"
        onRequestClose={checkout.dongThanhToan}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={checkout.dongThanhToan}
          accessibilityLabel="Đóng chọn thanh toán"
        />
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Chọn hình thức thanh toán</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.key}
              style={[styles.paymentItem, checkout.hinhThuc === method.key && styles.paymentActive]}
              onPress={() => checkout.setHinhThuc(method.key)}
            >
              <Text style={styles.paymentLabel}>{method.label}</Text>
              {checkout.hinhThuc === method.key && <Text style={styles.check}>✓</Text>}
            </TouchableOpacity>
          ))}
          <Text style={styles.confirmTotal}>Tổng: {checkout.tongTien.toLocaleString('vi-VN')}đ</Text>
          <Button
            title="Xác nhận thanh toán"
            onPress={checkout.xacNhanThanhToan}
            loading={checkout.dangThanhToan}
          />
          <Button title="Hủy" variant="outline" onPress={checkout.dongThanhToan} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 16 },
  footer: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, color: Colors.textSecondary },
  total: { fontSize: 22, fontWeight: '800', color: Colors.primary },
  buttonRow: { flexDirection: 'row', gap: 10 },
  checkoutButton: { flex: 1 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyIcon: { fontSize: 60 },
  emptyText: { fontSize: 18, color: Colors.textMuted, fontWeight: '600' },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  paymentActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  paymentLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  check: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  confirmTotal: { fontSize: 16, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
});
