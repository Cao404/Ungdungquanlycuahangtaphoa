import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SanPham } from '../types/SanPham';
import Colors from '../constants/colors';

interface Props {
  sanPham: SanPham;
  onThem: (sanPham: SanPham) => void;
}

export default function SanPhamCard({ sanPham, onThem }: Props) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onThem(sanPham)}>
      {sanPham.hinhAnh ? (
        <Image source={{ uri: sanPham.hinhAnh }} style={styles.hinh} />
      ) : (
        <View style={[styles.hinh, styles.placeholder]}>
          <Text style={styles.placeholderText}>📦</Text>
        </View>
      )}
      <View style={styles.info}>
        <Text style={styles.ten} numberOfLines={2}>{sanPham.ten}</Text>
        <Text style={styles.gia}>{sanPham.gia.toLocaleString('vi-VN')}đ</Text>
        <Text style={styles.dvt}>{sanPham.donViTinh}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 10,
    margin: 6,
    flex: 1,
    elevation: 2,
    shadowColor: Colors.black,
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  hinh: { width: '100%', height: 100, borderRadius: 8, marginBottom: 8 },
  placeholder: { backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 32 },
  info: { gap: 2 },
  ten: { fontSize: 13, fontWeight: '600', color: Colors.text },
  gia: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  dvt: { fontSize: 11, color: Colors.textMuted },
});
