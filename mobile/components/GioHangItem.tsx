import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { GioHangItem } from '../store/gioHangStore';
import Colors from '../constants/colors';

interface Props {
  item: GioHangItem;
  onTang: () => void;
  onGiam: () => void;
  onXoa: () => void;
}

export default function GioHangItemComp({ item, onTang, onGiam, onXoa }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.ten} numberOfLines={1}>{item.tenSanPham}</Text>
        <Text style={styles.bienThe}>{item.tenBienThe}</Text>
        <Text style={styles.gia}>{item.donGia.toLocaleString('vi-VN')}đ × {item.soLuong}</Text>
      </View>
      <View style={styles.right}>
        <Text style={styles.thanh}>{item.thanhTien.toLocaleString('vi-VN')}đ</Text>
        <View style={styles.controls}>
          <TouchableOpacity style={styles.btn} onPress={onGiam}>
            <Text style={styles.btnTxt}>−</Text>
          </TouchableOpacity>
          <Text style={styles.sl}>{item.soLuong}</Text>
          <TouchableOpacity
            style={[styles.btn, item.soLuong >= item.soLuongTon && styles.btnDisabled]}
            onPress={onTang}
            disabled={item.soLuong >= item.soLuongTon}
          >
            <Text style={styles.btnTxt}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onXoa} style={styles.xoa}>
            <Text style={styles.xoaTxt}>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', paddingVertical: 12, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  info: { flex: 1, gap: 3 },
  ten:   { fontSize: 14, fontWeight: '700', color: Colors.text },
  bienThe: { fontSize: 12, color: Colors.textSecondary },
  gia:   { fontSize: 13, color: Colors.textMuted },
  right: { alignItems: 'flex-end', gap: 6 },
  thanh: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  btnTxt: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  btnDisabled: { opacity: 0.4 },
  sl: { minWidth: 22, textAlign: 'center', fontSize: 15, fontWeight: '700' },
  xoa: { padding: 4 },
  xoaTxt: { fontSize: 16 },
});
