import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { hoaDonService } from '../../services/hoadon.service';
import { HoaDon } from '../../types/HoaDon';
import Colors from '../../constants/colors';

export default function LichSuScreen() {
  const [danhSach, setDanhSach] = useState<HoaDon[]>([]);
  const [dangTai, setDangTai] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setDangTai(true);
      try {
        const data = await hoaDonService.layDanhSach();
        setDanhSach(data);
      } finally {
        setDangTai(false);
      }
    })();
  }, []);

  if (dangTai) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />;

  return (
    <FlatList
      data={danhSach}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      ListEmptyComponent={<Text style={styles.empty}>Chưa có hoá đơn nào</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => setExpanded(expanded === item.id ? null : item.id)}
        >
          <View style={styles.header}>
            <Text style={styles.id}>#{item.id.slice(0, 8)}</Text>
            <Text style={styles.ngay}>{new Date(item.ngayTao).toLocaleDateString('vi-VN')}</Text>
            <Text style={styles.tongTien}>{item.tongTien.toLocaleString('vi-VN')}đ</Text>
          </View>
          {expanded === item.id && item.chiTiet.map((ct, i) => (
            <Text key={i} style={styles.chiTiet}>
              • {ct.sanPham.ten}{ct.bienThe ? ` (${ct.bienThe.ten})` : ''} × {ct.soLuong}
            </Text>
          ))}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { padding: 12 },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 10, padding: 14, marginBottom: 10,
    elevation: 1, shadowColor: Colors.black, shadowOpacity: 0.06, shadowRadius: 3,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontWeight: '700', color: Colors.text, fontSize: 14 },
  ngay: { color: Colors.textSecondary, fontSize: 13 },
  tongTien: { fontWeight: '700', color: Colors.primary, fontSize: 15 },
  chiTiet: { color: Colors.textSecondary, fontSize: 13, marginTop: 6, marginLeft: 4 },
  empty: { textAlign: 'center', marginTop: 60, color: Colors.textMuted, fontSize: 15 },
});
