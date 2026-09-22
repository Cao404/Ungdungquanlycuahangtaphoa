import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { SanPham } from '../types/SanPham';
import Colors from '../constants/colors';

interface Props {
  sanPham: SanPham;
  onPress: (sp: SanPham) => void;
}

export default function SanPhamCard({ sanPham, onPress }: Props) {
  const coNhieuBienThe = sanPham.bienThe.length > 1;
  const giaTu = sanPham.bienThe.length
    ? Math.min(...sanPham.bienThe.map((item) => item.giaBan))
    : null;

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(sanPham)} activeOpacity={0.8}>
      {sanPham.hinhAnh
        ? <Image source={{ uri: sanPham.hinhAnh }} style={styles.img} />
        : <View style={[styles.img, styles.placeholder]}><Text style={styles.emoji}>📦</Text></View>
      }
      <View style={styles.body}>
        <Text style={styles.ten} numberOfLines={2}>{sanPham.ten}</Text>
        {sanPham.thuongHieu && <Text style={styles.brand}>{sanPham.thuongHieu}</Text>}
        <Text style={styles.gia}>
          {giaTu === null
            ? 'Chưa có giá'
            : `${coNhieuBienThe ? 'Từ ' : ''}${giaTu.toLocaleString('vi-VN')}đ`}
        </Text>
        <Text style={styles.tag}>{sanPham.danhMuc}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: Colors.surface,
    borderRadius: 12, marginHorizontal: 12, marginVertical: 5,
    padding: 10, elevation: 2,
    shadowColor: Colors.black, shadowOpacity: 0.07, shadowRadius: 6,
  },
  img: { width: 72, height: 72, borderRadius: 8, marginRight: 12 },
  placeholder: { backgroundColor: Colors.background, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 },
  body: { flex: 1, justifyContent: 'center', gap: 3 },
  ten: { fontSize: 14, fontWeight: '700', color: Colors.text },
  brand: { fontSize: 12, color: Colors.textSecondary },
  gia: { fontSize: 15, fontWeight: '800', color: Colors.primary },
  tag: {
    alignSelf: 'flex-start', fontSize: 11, color: Colors.primary,
    backgroundColor: Colors.primaryLight, borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 2, marginTop: 2,
  },
});
