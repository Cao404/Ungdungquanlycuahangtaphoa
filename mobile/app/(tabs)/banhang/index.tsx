import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { io, Socket } from 'socket.io-client';
import SanPhamCard from '../../../components/SanPhamCard';
import Button from '../../../components/ui/Button';
import { useSanPhamSearch } from '../../../hooks/useSanPhamSearch';
import Colors from '../../../constants/colors';
import { useGioHangStore } from '../../../store/gioHangStore';
import { scannerService } from '../../../services/scanner.service';
import { sanPhamService } from '../../../services/sanpham.service';
import { getApiErrorMessage } from '../../../services/api';
import { useAuthStore } from '../../../store/authStore';
import { API_BASE_URL } from '../../../constants/config';
import { ScannerSession } from '../../../types/Scanner';

export default function BanHangScreen() {
  const token = useAuthStore((s) => s.token);
  const employee = useAuthStore((s) => s.nguoiDung);
  const them = useGioHangStore((s) => s.them);
  const soMon = useGioHangStore((s) => s.soMon());
  const tongTien = useGioHangStore((s) => s.tongTien());
  const [session, setSession] = useState<ScannerSession | null>(null);
  const [pairing, setPairing] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const lastScan = useRef<{ barcode: string; at: number } | null>(null);
  const { query, setQuery, danhMuc, chonDanhMuc, categories, sanPhams, loading, error, refetch, chonSanPham } = useSanPhamSearch();

  const processBarcode = useCallback(async (barcode: string) => {
    const now = Date.now();
    if (lastScan.current?.barcode === barcode && now - lastScan.current.at < 1200) return;
    lastScan.current = { barcode, at: now };
    try {
      const variant = await sanPhamService.getByBarcode(barcode);
      if (variant.soLuongTon <= 0) return Alert.alert('Đã hết hàng', 'Sản phẩm đã hết hàng.');
      if (!them(variant.sanPham, variant, 1)) return Alert.alert('Không đủ tồn kho', 'Số lượng trong giỏ đã đạt tồn kho hiện tại.');
    } catch (e: any) {
      const unknownBarcode = e?.response?.status === 404;
      Alert.alert(
        unknownBarcode ? 'Mã vạch chưa được đăng ký' : 'Không thể thêm sản phẩm',
        unknownBarcode
          ? `Mã ${barcode} chưa thuộc loại hàng nào trong cửa hàng. Chủ cửa hàng cần khai báo mã này ở trang quản trị và nhập hàng trước khi bán.`
          : getApiErrorMessage(e, 'Không thể xử lý mã vạch.'),
      );
    }
  }, [them]);

  const connectSocket = useCallback((created: ScannerSession) => {
    socketRef.current?.disconnect();
    const socket = io(API_BASE_URL.replace(/\/api$/, ''), { auth: { token }, transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('scanner:join', created.sessionId, (result: { ok: boolean; status?: ScannerSession['status'] }) => {
      if (result.ok && result.status) setSession((value) => value ? { ...value, status: result.status! } : value);
    }));
    socket.on('scanner:status', (next: ScannerSession) => setSession(next));
    socket.on('scanner:barcode', ({ barcode }: { barcode: string }) => void processBarcode(barcode));
    socket.on('connect_error', () => setSession((value) => value ? { ...value, status: 'DISCONNECTED' } : value));
  }, [processBarcode, token]);

  const startPairing = async () => {
    setPairing(true);
    try { const created = await scannerService.createSession(); setSession(created); connectSocket(created); }
    catch (e) { setPairing(false); Alert.alert('Không thể tạo phiên quét', getApiErrorMessage(e)); }
  };

  const closePairing = async () => {
    if (session) await scannerService.close(session.sessionId).catch(() => undefined);
    socketRef.current?.disconnect(); socketRef.current = null; setSession(null); setPairing(false);
  };

  useEffect(() => () => { socketRef.current?.disconnect(); }, []);
  useEffect(() => {
    if (!session || ['CLOSED', 'EXPIRED'].includes(session.status)) return;
    const timer = setInterval(() => scannerService.getSession(session.sessionId).then(setSession).catch(() => undefined), 5000);
    return () => clearInterval(timer);
  }, [session?.sessionId, session?.status]);

  const statusText = session?.status === 'CONNECTED' ? 'iPhone đã kết nối'
    : session?.status === 'EXPIRED' ? 'Mã kết nối đã hết hạn'
    : session?.status === 'DISCONNECTED' ? 'Mất kết nối với iPhone'
    : 'Đang chờ iPhone kết nối';

  return <View style={styles.page}>
    <View style={styles.header}>
      <View><Text style={styles.store}>Tạp hóa</Text><Text style={styles.employee}>{employee?.hoTen ?? 'Nhân viên'}</Text></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Mở giỏ hàng" onPress={() => router.push('/(tabs)/giohang')} style={styles.cartIcon}>
        <Ionicons name="bag-outline" size={23} color={Colors.primary} />
        {soMon > 0 && <Text style={styles.badge}>{soMon}</Text>}
      </Pressable>
    </View>

    <View style={styles.searchRow}>
      <View style={styles.searchBox}><Ionicons name="search-outline" size={20} color={Colors.textSecondary} /><TextInput accessibilityLabel="Tìm sản phẩm" style={styles.searchInput} placeholder="Tìm tên, mã hoặc barcode" value={query} onChangeText={setQuery} returnKeyType="search" /></View>
      <Pressable accessibilityRole="button" accessibilityLabel="Quét mã vạch" onPress={() => router.push('/scanner')} style={styles.scanButton}><Ionicons name="barcode-outline" size={24} color={Colors.white} /></Pressable>
    </View>

    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={styles.categories}>
      {categories.map((item) => <Pressable key={item} onPress={() => chonDanhMuc(item)} style={[styles.chip, danhMuc === item && styles.chipActive]}><Text style={[styles.chipText, danhMuc === item && styles.chipTextActive]}>{item}</Text></Pressable>)}
    </ScrollView>

    {!pairing ? <Pressable accessibilityRole="button" onPress={startPairing} style={styles.remoteAction}><Ionicons name="phone-portrait-outline" size={19} color={Colors.primary} /><Text style={styles.remoteText}>Kết nối iPhone làm máy quét</Text></Pressable>
      : <View style={styles.pairPanel}><View style={styles.pairInfo}><Text style={styles.pairLabel}>{statusText}</Text><Text style={styles.code}>{session?.pairingCode ?? '...'}</Text><Text style={styles.expiry}>Mã có hiệu lực trong 10 phút</Text></View><Pressable accessibilityLabel="Đóng phiên quét" onPress={closePairing} style={styles.close}><Ionicons name="close" size={22} color={Colors.textSecondary} /></Pressable></View>}

    {loading ? <View style={styles.skeletonWrap}>{[0, 1, 2, 3].map((item) => <View key={item} style={styles.skeleton} />)}</View>
      : error ? <View style={styles.state}><Ionicons name="cloud-offline-outline" size={38} color={Colors.danger} /><Text style={styles.stateTitle}>Không thể tải sản phẩm</Text><Text style={styles.stateBody}>{error}</Text><Button title="Thử lại" variant="outline" onPress={refetch} /></View>
      : <FlatList data={sanPhams} keyExtractor={(item) => item.id} renderItem={({ item }) => <SanPhamCard sanPham={item} onPress={chonSanPham} />} contentContainerStyle={styles.list} ListEmptyComponent={<View style={styles.state}><Ionicons name="search-outline" size={38} color={Colors.textMuted} /><Text style={styles.stateTitle}>Không tìm thấy sản phẩm</Text><Text style={styles.stateBody}>Thử tên, mã sản phẩm hoặc barcode khác.</Text></View>} />}

    {soMon > 0 && <Pressable accessibilityRole="button" accessibilityLabel={`Mở giỏ hàng, ${soMon} món`} onPress={() => router.push('/(tabs)/giohang')} style={styles.cartBar}><View><Text style={styles.cartCount}>{soMon} món trong giỏ</Text><Text style={styles.cartTotal}>{tongTien.toLocaleString('vi-VN')}đ</Text></View><View style={styles.cartLink}><Text style={styles.cartLinkText}>Xem giỏ</Text><Ionicons name="arrow-forward" size={18} color={Colors.white} /></View></Pressable>}
  </View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background }, header: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  store: { fontSize: 22, fontWeight: '800', color: Colors.text }, employee: { color: Colors.textSecondary, marginTop: 2 }, cartIcon: { width: 46, height: 46, alignItems: 'center', justifyContent: 'center', borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  badge: { position: 'absolute', top: -4, right: -4, minWidth: 19, height: 19, borderRadius: 10, textAlign: 'center', lineHeight: 19, color: Colors.white, backgroundColor: Colors.accent, fontSize: 11, fontWeight: '800' },
  searchRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 }, searchBox: { flex: 1, minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13, borderRadius: 12, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }, searchInput: { flex: 1, color: Colors.text, fontSize: 15 },
  scanButton: { width: 50, minHeight: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary }, categoryBar: { maxHeight: 47, marginTop: 12 }, categories: { paddingHorizontal: 16, gap: 8 },
  chip: { minHeight: 36, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center', borderRadius: 18, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }, chipActive: { backgroundColor: Colors.primarySoft, borderColor: Colors.primary }, chipText: { color: Colors.textSecondary, fontWeight: '700' }, chipTextActive: { color: Colors.primary },
  remoteAction: { minHeight: 46, marginHorizontal: 16, marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary, backgroundColor: Colors.surface }, remoteText: { color: Colors.primary, fontWeight: '800' },
  pairPanel: { marginHorizontal: 16, marginTop: 10, padding: 14, flexDirection: 'row', backgroundColor: Colors.primarySoft, borderRadius: 12, borderWidth: 1, borderColor: Colors.primary }, pairInfo: { flex: 1 }, pairLabel: { color: Colors.primary, fontWeight: '800' }, code: { fontSize: 24, letterSpacing: 4, fontWeight: '900', color: Colors.text, marginTop: 4 }, expiry: { color: Colors.textSecondary, fontSize: 12, marginTop: 3 }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  list: { paddingTop: 8, paddingBottom: 100 }, skeletonWrap: { padding: 16, gap: 10 }, skeleton: { height: 92, borderRadius: 12, backgroundColor: Colors.surfaceMuted }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }, stateTitle: { marginTop: 12, color: Colors.text, fontSize: 17, fontWeight: '800' }, stateBody: { marginTop: 5, marginBottom: 16, textAlign: 'center', color: Colors.textSecondary, lineHeight: 20 },
  cartBar: { position: 'absolute', left: 16, right: 16, bottom: 12, minHeight: 68, borderRadius: 14, paddingHorizontal: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.primary }, cartCount: { color: Colors.white, fontWeight: '700' }, cartTotal: { color: Colors.white, fontSize: 18, fontWeight: '900', marginTop: 2 }, cartLink: { flexDirection: 'row', gap: 6, alignItems: 'center' }, cartLinkText: { color: Colors.white, fontWeight: '800' },
});
