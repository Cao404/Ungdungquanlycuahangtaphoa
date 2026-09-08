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

export default function GioHangItemComponent({ item, onTang, onGiam, onXoa }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.ten}>{item.sanPham.ten}</Text>
        {item.bienThe && <Text style={styles.bienThe}>{item.bienThe.ten}</Text>}
        <Text style={styles.gia}>{item.donGia.toLocaleString('vi-VN')}đ</Text>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.btn} onPress={onGiam}>
          <Text style={styles.btnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.soLuong}>{item.soLuong}</Text>
        <TouchableOpacity style={styles.btn} onPress={onTang}>
          <Text style={styles.btnText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onXoa} style={styles.xoa}>
          <Text style={styles.xoaText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 8,
  },
  info: { flex: 1 },
  ten: { fontSize: 14, fontWeight: '600', color: Colors.text },
  bienThe: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  gia: { fontSize: 13, color: Colors.primary, marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btn: {
    width: 32, height: 32, borderRadius: 6,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center',
  },
  btnText: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  soLuong: { minWidth: 24, textAlign: 'center', fontSize: 15, fontWeight: '600' },
  xoa: { padding: 4 },
  xoaText: { fontSize: 18 },
});
