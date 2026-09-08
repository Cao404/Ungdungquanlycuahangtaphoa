import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, Alert } from 'react-native';
import GioHangItemComponent from '../../../components/GioHangItem';
import Button from '../../../components/ui/Button';
import { useGioHang } from '../../../hooks/useGioHang';
import { hoaDonService } from '../../../services/hoadon.service';
import Colors from '../../../constants/colors';

export default function GioHangScreen() {
  const { state, them, xoa, capNhatSoLuong, xoaHet, tongTien } = useGioHang();
  const [dangXuLy, setDangXuLy] = useState(false);

  const thanhToan = async () => {
    if (state.items.length === 0) return;
    setDangXuLy(true);
    try {
      await hoaDonService.taoHoaDon(state.items);
      xoaHet();
      Alert.alert('✅ Thành công', 'Đã tạo hoá đơn!');
    } catch (e: any) {
      Alert.alert('Lỗi', e.message);
    } finally {
      setDangXuLy(false);
    }
  };

  if (state.items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>🛒 Giỏ hàng trống</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={state.items}
        keyExtractor={(item, i) => `${item.sanPham.id}-${item.bienThe?.id ?? i}`}
        renderItem={({ item }) => (
          <GioHangItemComponent
            item={item}
            onTang={() => capNhatSoLuong(item.sanPham.id, item.bienThe?.id, item.soLuong + 1)}
            onGiam={() => {
              if (item.soLuong <= 1) xoa(item.sanPham.id, item.bienThe?.id);
              else capNhatSoLuong(item.sanPham.id, item.bienThe?.id, item.soLuong - 1);
            }}
            onXoa={() => xoa(item.sanPham.id, item.bienThe?.id)}
          />
        )}
        contentContainerStyle={styles.list}
      />
      <View style={styles.footer}>
        <Text style={styles.tong}>Tổng: <Text style={styles.tongSo}>{tongTien.toLocaleString('vi-VN')}đ</Text></Text>
        <Button title="Thanh toán" onPress={thanhToan} loading={dangXuLy} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: 16 },
  footer: {
    padding: 16, backgroundColor: Colors.surface,
    borderTopWidth: 1, borderTopColor: Colors.border, gap: 12,
  },
  tong: { fontSize: 15, color: Colors.text },
  tongSo: { fontWeight: '700', color: Colors.primary, fontSize: 18 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { fontSize: 16, color: Colors.textMuted },
});
