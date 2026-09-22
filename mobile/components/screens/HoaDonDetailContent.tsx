import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHoaDonDetail } from '../../hooks/useLichSuHoaDon';
import Colors from '../../constants/colors';
import Button from '../ui/Button';

export default function HoaDonDetailContent() {
  const { data: hoaDon, loading, error, refetch } = useHoaDonDetail();

  if (loading && !hoaDon) return <ActivityIndicator style={styles.center} color={Colors.primary} size="large" />;
  if (error) return (
    <View style={styles.center}>
      <Text style={styles.error}>{error}</Text>
      <Button title="Thử lại" onPress={refetch} />
    </View>
  );
  if (!hoaDon) return <Text style={styles.error}>Không tìm thấy hóa đơn</Text>;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Hóa đơn #{String(hoaDon.id).padStart(6, '0')}</Text>
      <Text style={styles.muted}>{new Date(hoaDon.ngayBan).toLocaleString('vi-VN')}</Text>
      <Text style={styles.muted}>Nhân viên: {hoaDon.nguoiBan?.hoTen ?? '—'}</Text>
      <View style={styles.card}>
        <Text style={styles.section}>Sản phẩm</Text>
        {hoaDon.chiTiet.map((line) => (
          <View key={line.id ?? line.bienTheId} style={styles.line}>
            <View style={styles.lineName}>
              <Text style={styles.name}>{line.bienThe?.sanPham.ten ?? `Biến thể #${line.bienTheId}`}</Text>
              <Text style={styles.muted}>{line.bienThe?.tenBienThe ?? ''} · {line.soLuong} × {line.donGia.toLocaleString('vi-VN')}đ</Text>
            </View>
            <Text style={styles.amount}>{line.thanhTien.toLocaleString('vi-VN')}đ</Text>
          </View>
        ))}
      </View>
      <View style={styles.card}>
        <View style={styles.line}><Text>Giảm giá</Text><Text>{hoaDon.giamGia.toLocaleString('vi-VN')}đ</Text></View>
        <View style={styles.line}><Text>Hình thức</Text><Text>{hoaDon.hinhThucTT === 'tienmat' ? 'Tiền mặt' : hoaDon.hinhThucTT === 'chuyenkhoan' ? 'Chuyển khoản' : 'Công nợ'}</Text></View>
        <View style={styles.line}><Text>Trạng thái</Text><Text>{hoaDon.trangThaiTT === 'daTT' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text></View>
        <View style={styles.line}><Text style={styles.section}>Tổng tiền</Text><Text style={styles.total}>{hoaDon.tongTien.toLocaleString('vi-VN')}đ</Text></View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text },
  muted: { color: Colors.textSecondary, fontSize: 13 },
  card: { backgroundColor: Colors.surface, borderRadius: 12, padding: 16, gap: 12 },
  section: { fontSize: 16, fontWeight: '700', color: Colors.text },
  line: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  lineName: { flex: 1, gap: 3 },
  name: { color: Colors.text, fontWeight: '600' },
  amount: { color: Colors.text, fontWeight: '600' },
  total: { color: Colors.primary, fontSize: 18, fontWeight: '800' },
  error: { color: Colors.danger, textAlign: 'center' },
});
