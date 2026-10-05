import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Colors from '../../constants/colors';
import Button from '../../components/ui/Button';
import { getApiErrorMessage } from '../../services/api';
import { hoaDonService } from '../../services/hoadon.service';
import { HinhThucTT, HoaDon } from '../../types/HoaDon';

const methods: Record<HinhThucTT, string> = { tienmat: 'Tiền mặt', chuyenkhoan: 'Chuyển khoản', congno: 'Công nợ' };
export default function LichSuScreen() {
  const [q, setQ] = useState(''); const [rows, setRows] = useState<HoaDon[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState('');
  const load = useCallback(async (search = q) => { setLoading(true); setError(''); try { setRows(await hoaDonService.getAll(search.trim())); } catch (e) { setError(getApiErrorMessage(e)); } finally { setLoading(false); } }, [q]);
  useFocusEffect(useCallback(() => { void load(); }, []));
  useEffect(() => { const timer = setTimeout(() => void load(q), 320); return () => clearTimeout(timer); }, [q]);
  return <View style={styles.page}>
    <View style={styles.heading}><Text style={styles.title}>Hóa đơn của tôi</Text><Text style={styles.subtitle}>Tra cứu các giao dịch đã hoàn tất</Text></View>
    <View style={styles.search}><Ionicons name="search" size={20} color={Colors.textMuted} /><TextInput value={q} onChangeText={setQ} keyboardType="number-pad" placeholder="Tìm theo mã hóa đơn" placeholderTextColor={Colors.textMuted} style={styles.searchInput} />{!!q && <Pressable accessibilityLabel="Xóa tìm kiếm" onPress={() => setQ('')}><Ionicons name="close-circle" size={20} color={Colors.textMuted} /></Pressable>}</View>
    {loading && !rows.length ? <View style={styles.center}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Đang tải hóa đơn...</Text></View> : error ? <View style={styles.center}><Ionicons name="cloud-offline-outline" size={32} color={Colors.danger} /><Text style={styles.error}>{error}</Text><Button title="Thử lại" variant="outline" onPress={() => load()} /></View> :
      <FlatList data={rows} keyExtractor={(i) => String(i.id)} contentContainerStyle={rows.length ? styles.list : styles.emptyList} refreshing={loading} onRefresh={() => load()}
        ListEmptyComponent={<View style={styles.center}><Ionicons name="receipt-outline" size={34} color={Colors.textMuted} /><Text style={styles.emptyTitle}>{q ? 'Không tìm thấy hóa đơn' : 'Chưa có hóa đơn'}</Text><Text style={styles.muted}>{q ? 'Kiểm tra lại mã hóa đơn.' : 'Hóa đơn hoàn tất sẽ xuất hiện tại đây.'}</Text></View>}
        renderItem={({ item }) => <Pressable onPress={() => router.push(`/invoice/${item.id}`)} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
          <View style={styles.icon}><Ionicons name="receipt-outline" size={20} color={Colors.primary} /></View><View style={styles.grow}><Text style={styles.invoice}>#{String(item.id).padStart(6, '0')}</Text><Text style={styles.muted}>{new Date(item.ngayBan).toLocaleString('vi-VN')} · {methods[item.hinhThucTT]}</Text></View><View style={styles.right}><Text style={styles.amount}>{Number(item.tongTien).toLocaleString('vi-VN')}đ</Text><Text style={[styles.status, item.trangThaiTT === 'chuaTT' && styles.unpaid]}>{item.trangThaiTT === 'daTT' ? 'Đã thanh toán' : 'Chưa thanh toán'}</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
        </Pressable>} />}
  </View>;
}
const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: Colors.background }, heading: { paddingHorizontal: 18, paddingTop: 18 }, title: { fontSize: 24, fontWeight: '900', color: Colors.text }, subtitle: { color: Colors.textSecondary, marginTop: 4 }, search: { margin: 18, minHeight: 50, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, borderRadius: 13, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface }, searchInput: { flex: 1, color: Colors.text, fontSize: 15 }, list: { paddingHorizontal: 18, paddingBottom: 24 }, emptyList: { flexGrow: 1 }, row: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 11, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border }, pressed: { opacity: 0.65 }, icon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primarySoft }, grow: { flex: 1 }, invoice: { color: Colors.text, fontWeight: '900', marginBottom: 4 }, right: { alignItems: 'flex-end' }, amount: { color: Colors.text, fontWeight: '900' }, status: { marginTop: 4, fontSize: 11, color: Colors.success, fontWeight: '700' }, unpaid: { color: Colors.accent }, muted: { color: Colors.textSecondary, fontSize: 13 }, center: { flex: 1, minHeight: 250, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 10 }, error: { color: Colors.danger, textAlign: 'center' }, emptyTitle: { color: Colors.text, fontWeight: '800', fontSize: 16 } });
