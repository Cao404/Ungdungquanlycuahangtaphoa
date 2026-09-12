import React, { useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useFetch } from '../../hooks/useFetch';
import { hoaDonService } from '../../services/hoadon.service';
import { HoaDon } from '../../types/HoaDon';
import Colors from '../../constants/colors';

const labelTT: Record<string, string> = {
  tienmat: '💵 Tiền mặt',
  chuyenkhoan: '📲 CK',
  congno: '📋 Công nợ',
};

export default function LichSuScreen() {
  const { data, loading, error, refetch } = useFetch(hoaDonService.getAll);
  const [expanded, setExpanded] = useState<string | null>(null);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
  if (error) return <Text style={styles.errorTxt}>{error}</Text>;

  return (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      onRefresh={refetch}
      refreshing={loading}
      ListEmptyComponent={<Text style={styles.empty}>Chưa có hoá đơn nào</Text>}
      renderItem={({ item }: { item: HoaDon }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => setExpanded(expanded === item.id ? null : item.id)}
          activeOpacity={0.8}
        >
          {/* Header hoá đơn */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.hdId}>#{item.id.slice(-8).toUpperCase()}</Text>
              <Text style={styles.ngay}>{new Date(item.ngayBan).toLocaleString('vi-VN')}</Text>
            </View>
            <View style={styles.right}>
              <Text style={styles.tongTien}>{item.tongTien.toLocaleString('vi-VN')}đ</Text>
              <Text style={styles.hinhThuc}>{labelTT[item.hinhThucTT]}</Text>
            </View>
          </View>

          {/* Chi tiết (mở rộng khi bấm) */}
          {expanded === item.id && item.chiTiets.map((ct, i) => (
            <Text key={i} style={styles.chiTiet}>
              • {ct.bienThe.sanPham.ten} ({ct.bienThe.tenBienThe}) × {ct.soLuong}
              {'  '}{ct.thanhTien.toLocaleString('vi-VN')}đ
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
    backgroundColor: Colors.surface, borderRadius: 12, padding: 14,
    marginBottom: 10, elevation: 1,
    shadowColor: Colors.black, shadowOpacity: 0.06, shadowRadius: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  hdId:   { fontWeight: '700', fontSize: 14, color: Colors.text },
  ngay:   { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  right:  { alignItems: 'flex-end' },
  tongTien: { fontWeight: '800', fontSize: 16, color: Colors.primary },
  hinhThuc: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  chiTiet:  { fontSize: 13, color: Colors.textSecondary, marginTop: 8, marginLeft: 4 },
  empty:    { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 15 },
  errorTxt: { textAlign: 'center', color: Colors.danger, marginTop: 40 },
});
