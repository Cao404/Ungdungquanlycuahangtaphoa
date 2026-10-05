import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '../components/ui/Button';
import Colors from '../constants/colors';
import { HinhThucTT } from '../types/HoaDon';

const methodLabels: Record<HinhThucTT, string> = { tienmat: 'Tiền mặt', chuyenkhoan: 'Chuyển khoản', congno: 'Công nợ' };
export default function PaymentSuccessScreen() {
  const p = useLocalSearchParams<{ id: string; total: string; method: HinhThucTT; change: string }>();
  const total = Number(p.total || 0); const change = Number(p.change || 0);
  return <View style={styles.page}>
    <View style={styles.mark}><Ionicons name="checkmark" size={38} color={Colors.white} /></View>
    <Text style={styles.eyebrow}>ĐÃ GHI NHẬN</Text><Text style={styles.title}>{p.method === 'congno' ? 'Đã ghi nhận công nợ' : 'Thanh toán thành công'}</Text>
    <Text style={styles.invoice}>Hóa đơn #{String(p.id).padStart(6, '0')}</Text>
    <View style={styles.summary}><Row label="Tổng thanh toán" value={`${total.toLocaleString('vi-VN')}đ`} /><Row label="Hình thức" value={methodLabels[p.method] ?? p.method} />{change > 0 && <Row label="Tiền thừa" value={`${change.toLocaleString('vi-VN')}đ`} />}</View>
    <Button title="Xem chi tiết hóa đơn" variant="outline" onPress={() => router.replace(`/invoice/${p.id}`)} />
    <Button title="Tạo đơn mới" size="lg" onPress={() => router.replace('/(tabs)/banhang')} />
  </View>;
}
function Row({ label, value }: { label: string; value: string }) { return <View style={styles.row}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View>; }
const styles = StyleSheet.create({ page: { flex: 1, padding: 26, justifyContent: 'center', backgroundColor: Colors.background }, mark: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.success, marginBottom: 24 }, eyebrow: { fontSize: 11, letterSpacing: 1.5, color: Colors.success, fontWeight: '900' }, title: { fontSize: 29, lineHeight: 35, fontWeight: '900', color: Colors.text, marginTop: 5 }, invoice: { color: Colors.textSecondary, marginTop: 7, marginBottom: 28 }, summary: { paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: Colors.border, marginBottom: 24 }, row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 }, label: { color: Colors.textSecondary }, value: { color: Colors.text, fontWeight: '800' } });
