import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import Colors from '../../constants/colors';
import Button from '../../components/ui/Button';
import { getApiErrorMessage } from '../../services/api';
import { hoaDonService } from '../../services/hoadon.service';
import { HoaDon, HinhThucTT } from '../../types/HoaDon';

const methods: Record<HinhThucTT, string> = { tienmat: 'Tiền mặt', chuyenkhoan: 'Chuyển khoản', congno: 'Công nợ' };
export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>(); const [invoice, setInvoice] = useState<HoaDon | null>(null); const [error, setError] = useState(''); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => { setLoading(true); setError(''); try { setInvoice(await hoaDonService.getById(id)); } catch (e) { setError(getApiErrorMessage(e)); } finally { setLoading(false); } }, [id]);
  useFocusEffect(useCallback(() => { void load(); }, [load]));
  if (loading) return <View style={styles.center}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Đang tải hóa đơn...</Text></View>;
  if (!invoice) return <View style={styles.center}><Text style={styles.error}>{error}</Text><Button title="Thử lại" variant="outline" onPress={load} /></View>;
  return <ScrollView style={styles.page} contentContainerStyle={styles.content}>
    <Text style={styles.eyebrow}>HÓA ĐƠN</Text><Text style={styles.title}>#{String(invoice.id).padStart(6, '0')}</Text><Text style={styles.muted}>{new Date(invoice.ngayBan).toLocaleString('vi-VN')}</Text>
    <View style={styles.meta}><Meta label="Nhân viên" value={invoice.nguoiBan?.hoTen ?? 'Không rõ'} /><Meta label="Khách hàng" value={invoice.khachHang?.ten ?? 'Khách lẻ'} /><Meta label="Thanh toán" value={methods[invoice.hinhThucTT]} /><Meta label="Trạng thái" value={invoice.trangThaiTT === 'daTT' ? 'Đã thanh toán' : 'Chưa thanh toán'} /></View>
    <Text style={styles.sectionTitle}>Sản phẩm</Text>
    <View style={styles.lines}>{invoice.chiTiets.map((line, index) => <View key={`${line.bienTheId}-${index}`} style={styles.line}><View style={styles.grow}><Text style={styles.product}>{line.bienThe.sanPham.ten}</Text><Text style={styles.muted}>{line.bienThe.giaTri} {line.bienThe.donVi} · {line.soLuong} × {line.donGia.toLocaleString('vi-VN')}đ</Text></View><Text style={styles.amount}>{line.thanhTien.toLocaleString('vi-VN')}đ</Text></View>)}</View>
    <View style={styles.summary}><Total label="Tạm tính" value={invoice.tamTinh} /><Total label="Giảm giá" value={-invoice.giamGia} />{!!invoice.lyDoGiamGia && <Meta label="Lý do" value={invoice.lyDoGiamGia} />}<Total label="Thuế hóa đơn" value={invoice.thue} /><View style={styles.rule} /><Total label="Tổng cộng" value={invoice.tongTien} strong />{invoice.hinhThucTT === 'tienmat' && <><Total label="Khách đưa" value={invoice.tienKhachDua ?? 0} /><Total label="Tiền thừa" value={invoice.tienThua ?? 0} /></>}{invoice.hinhThucTT === 'congno' && <><Total label="Đã trả" value={invoice.soTienDaThanhToan ?? 0} /><Total label="Còn nợ" value={Math.max(0, invoice.tongTien - (invoice.soTienDaThanhToan ?? 0))} /></>}</View>
  </ScrollView>;
}
function Meta({ label, value }: { label: string; value: string }) { return <View style={styles.metaRow}><Text style={styles.muted}>{label}</Text><Text style={styles.metaValue}>{value}</Text></View>; }
function Total({ label, value, strong }: { label: string; value: number; strong?: boolean }) { return <View style={styles.metaRow}><Text style={strong ? styles.strong : styles.muted}>{label}</Text><Text style={strong ? styles.total : styles.metaValue}>{value.toLocaleString('vi-VN')}đ</Text></View>; }
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: Colors.background }, content: { padding: 20, paddingBottom: 40 }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 14, backgroundColor: Colors.background }, eyebrow: { color: Colors.primary, fontSize: 11, letterSpacing: 1.5, fontWeight: '900' }, title: { color: Colors.text, fontSize: 30, fontWeight: '900', marginTop: 4 }, muted: { color: Colors.textSecondary, fontSize: 13 }, error: { color: Colors.danger, textAlign: 'center' }, meta: { marginTop: 24, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border }, metaRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 9, gap: 12 }, metaValue: { color: Colors.text, fontWeight: '700', textAlign: 'right' }, sectionTitle: { color: Colors.text, fontWeight: '900', fontSize: 16, marginTop: 26, marginBottom: 8 }, lines: { backgroundColor: Colors.surface, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 14 }, line: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.border }, grow: { flex: 1 }, product: { color: Colors.text, fontWeight: '800', marginBottom: 3 }, amount: { color: Colors.text, fontWeight: '800' }, summary: { marginTop: 22 }, rule: { height: 1, backgroundColor: Colors.border, marginVertical: 5 }, strong: { color: Colors.text, fontWeight: '900', fontSize: 16 }, total: { color: Colors.primary, fontWeight: '900', fontSize: 20 } });
