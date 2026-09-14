import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, Alert, Image,
  Modal, TouchableOpacity, ScrollView,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { router } from 'expo-router';
import { useGioHang } from '../../hooks/useGioHang';
import GioHangItemComp from '../../components/GioHangItem';
import Button from '../../components/ui/Button';
import { hoaDonService } from '../../services/hoadon.service';
import { useAuthStore } from '../../store/authStore';
import { HinhThucTT } from '../../types/HoaDon';
import Colors from '../../constants/colors';

const HINH_THUC: { key: HinhThucTT; label: string }[] = [
  { key: 'tienmat',     label: '💵 Tiền mặt' },
  { key: 'chuyenkhoan', label: '📲 Chuyển khoản' },
];

// Để dùng ảnh QR của bạn, đổi `null` thành require('../../assets/ten-anh.png').
let PAYMENT_QR_IMAGE: ImageSourcePropType | null = require('../../assets/QR.jpg');;

const QR_SIZE = 21;

function isFinderModule(row: number, column: number) {
  const finderCorners = [[0, 0], [0, QR_SIZE - 7], [QR_SIZE - 7, 0]];

  return finderCorners.some(([top, left]) => {
    const localRow = row - top;
    const localColumn = column - left;
    const inside = localRow >= 0 && localRow < 7 && localColumn >= 0 && localColumn < 7;

    if (!inside) return false;

    const isOuterBorder = localRow === 0 || localRow === 6 || localColumn === 0 || localColumn === 6;
    const isInnerSquare = localRow >= 2 && localRow <= 4 && localColumn >= 2 && localColumn <= 4;
    return isOuterBorder || isInnerSquare;
  });
}

function QrCodePreview() {
  return (
    <View style={styles.qrGrid}>
      {Array.from({ length: QR_SIZE }, (_, row) => (
        <View key={row} style={styles.qrRow}>
          {Array.from({ length: QR_SIZE }, (_, column) => {
            const isDark = isFinderModule(row, column)
              || ((row * 3 + column * 5 + row * column) % 7 < 3);

            return <View key={column} style={[styles.qrCell, isDark && styles.qrCellDark]} />;
          })}
        </View>
      ))}
    </View>
  );
}

export default function GioHangScreen() {
  const { items, capNhat, xoa, xoaHet, tongTien, soMon } = useGioHang();
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const [dangTT, setDangTT] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hinhThuc, setHinhThuc] = useState<HinhThucTT>('tienmat');

  const thanhToan = async () => {
    if (!nguoiDung) return;
    setDangTT(true);
    try {
      await hoaDonService.create({
        hinhThucTT: hinhThuc,
        chiTiet: items.map((i) => ({
          bienTheId: i.bienTheId,
          soLuong:   i.soLuong,
          donGia:    i.donGia,
          thanhTien: i.thanhTien,
        })),
      });
      xoaHet();
      setShowModal(false);
      Alert.alert('✅ Thành công', 'Hoá đơn đã được tạo!', [
        { text: 'Xem lịch sử', onPress: () => router.replace('/(tabs)/lichsu') },
        { text: 'OK' },
      ]);
    } catch (e: any) {
      Alert.alert('❌ Lỗi', e?.response?.data?.message ?? e.message);
    } finally {
      setDangTT(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTxt}>Giỏ hàng trống</Text>
        <Button title="Chọn sản phẩm" variant="outline" onPress={() => router.replace('/(tabs)/banhang')} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.bienTheId}
        renderItem={({ item }) => (
          <GioHangItemComp
            item={item}
            onTang={() => capNhat(item.bienTheId, item.soLuong + 1)}
            onGiam={() => capNhat(item.bienTheId, item.soLuong - 1)}
            onXoa={() => xoa(item.bienTheId)}
          />
        )}
        contentContainerStyle={styles.list}
      />

      {/* Footer tổng tiền + nút thanh toán */}
      <View style={styles.footer}>
        <View style={styles.tongRow}>
          <Text style={styles.tongLabel}>{soMon} món</Text>
          <Text style={styles.tongSo}>{tongTien.toLocaleString('vi-VN')}đ</Text>
        </View>
        <View style={styles.btnRow}>
          <Button title="Xoá hết" variant="ghost" onPress={xoaHet} />
          <Button title="Thanh toán" onPress={() => setShowModal(true)} style={styles.btnTT} />
        </View>
      </View>

      {/* Modal chọn hình thức thanh toán */}
      <Modal visible={showModal} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setShowModal(false)} />
        <View style={styles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetContent}>
            <Text style={styles.sheetTitle}>Chọn hình thức thanh toán</Text>
            {HINH_THUC.map((ht) => (
              <TouchableOpacity
                key={ht.key}
                style={[styles.htItem, hinhThuc === ht.key && styles.htActive]}
                onPress={() => setHinhThuc(ht.key)}
              >
                <Text style={styles.htLabel}>{ht.label}</Text>
                {hinhThuc === ht.key && <Text style={styles.check}>✓</Text>}
              </TouchableOpacity>
            ))}

            {hinhThuc === 'chuyenkhoan' && (
              <View style={styles.qrSection}>
                {PAYMENT_QR_IMAGE ? (
                  <Image source={PAYMENT_QR_IMAGE} style={styles.qrImage} resizeMode="contain" />
                ) : (
                  <QrCodePreview />
                )}
                <Text style={styles.qrMessage}>
                  Quý khách vui lòng quét mã để thanh toán đơn hàng
                </Text>
              </View>
            )}

            <Text style={styles.totalConfirm}>Tổng: {tongTien.toLocaleString('vi-VN')}đ</Text>
            <Button title="Xác nhận" onPress={thanhToan} loading={dangTT} />
            <Button title="Huỷ" variant="outline" onPress={() => setShowModal(false)} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list:      { paddingBottom: 16 },
  footer: {
    backgroundColor: Colors.surface, padding: 16,
    borderTopWidth: 1, borderTopColor: Colors.border, gap: 10,
  },
  tongRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tongLabel: { fontSize: 14, color: Colors.textSecondary },
  tongSo:  { fontSize: 22, fontWeight: '800', color: Colors.primary },
  btnRow:  { flexDirection: 'row', gap: 10 },
  btnTT:   { flex: 1 },
  empty:   { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 },
  emptyIcon: { fontSize: 60 },
  emptyTxt: { fontSize: 18, color: Colors.textMuted, fontWeight: '600' },
  overlay: {
    position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: Colors.surface, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '92%',
  },
  sheetContent: { padding: 24, gap: 12 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  htItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 14, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.border,
  },
  htActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  htLabel: { fontSize: 15, fontWeight: '600', color: Colors.text },
  check:   { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  qrSection: { alignItems: 'center', paddingVertical: 6 },
  qrImage: {
    width: 184,
    height: 184,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrGrid: {
    width: 184,
    height: 184,
    padding: 9,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  qrRow: { flex: 1, flexDirection: 'row' },
  qrCell: { flex: 1, backgroundColor: Colors.white },
  qrCellDark: { backgroundColor: Colors.black },
  qrMessage: {
    maxWidth: 290,
    color: Colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
  totalConfirm: { fontSize: 16, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
});
