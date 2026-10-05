import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import Button from '../components/ui/Button';
import Colors from '../constants/colors';
import { getApiErrorMessage } from '../services/api';
import { hoaDonService } from '../services/hoadon.service';
import { khachHangService } from '../services/khachhang.service';
import { useGioHangStore } from '../store/gioHangStore';
import { CheckoutQuote, HinhThucTT, HoaDon, KhachHang } from '../types/HoaDon';

const METHODS: { key: HinhThucTT; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'tienmat', label: 'Tiền mặt', icon: 'cash-outline' },
  { key: 'chuyenkhoan', label: 'Chuyển khoản', icon: 'swap-horizontal-outline' },
  { key: 'congno', label: 'Công nợ', icon: 'document-text-outline' },
];

export default function PaymentScreen() {
  const items = useGioHangStore((s) => s.items);
  const clearCart = useGioHangStore((s) => s.xoaHet);
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [method, setMethod] = useState<HinhThucTT>('tienmat');
  const [cash, setCash] = useState('');
  const [customer, setCustomer] = useState<KhachHang | null>(null);
  const [discount, setDiscount] = useState('');
  const [discountReason, setDiscountReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(Crypto.randomUUID());
  const lines = useMemo(() => items.map((i) => ({ bienTheId: i.bienTheId, soLuong: i.soLuong })), [items]);
  const cashNumber = Number(cash.replace(/\D/g, '')) || 0;
  const discountNumber = Number(discount.replace(/\D/g, '')) || 0;
  const change = Math.max(0, cashNumber - (quote?.tongTien ?? 0));

  const loadQuote = async () => {
    if (!lines.length) return router.replace('/(tabs)/giohang');
    setLoading(true); setError('');
    try { setQuote(await hoaDonService.quote({ khachHangId: customer?.id, giamGia: discountNumber, lyDoGiamGia: discountReason || undefined, chiTiet: lines })); }
    catch (e) { setError(getApiErrorMessage(e, 'Không thể kiểm tra đơn hàng.')); }
    finally { setLoading(false); }
  };
  useEffect(() => { const timer = setTimeout(() => void loadQuote(), 250); return () => clearTimeout(timer); }, [customer?.id, discountNumber]);

  const finish = (invoice: HoaDon) => {
    clearCart();
    router.replace({ pathname: '/payment-success', params: { id: invoice.id, total: String(invoice.tongTien), method: invoice.hinhThucTT, change: String(invoice.tienThua ?? 0) } });
  };

  const pay = async () => {
    if (!quote || paying) return;
    if (discountNumber > 0 && !discountReason.trim()) return Alert.alert('Thiếu lý do giảm giá', 'Hãy ghi ngắn gọn lý do như khách quen hoặc hàng gần hết hạn.');
    if (method === 'tienmat' && cashNumber < quote.tongTien) return Alert.alert('Tiền khách đưa chưa đủ', `Còn thiếu ${(quote.tongTien - cashNumber).toLocaleString('vi-VN')}đ.`);
    if (method === 'congno' && !customer) return Alert.alert('Cần chọn khách hàng', 'Đơn công nợ phải được gắn với một khách hàng.');
    setPaying(true); setError('');
    try {
      finish(await hoaDonService.create({ requestId: requestId.current, khachHangId: customer?.id, giamGia: discountNumber, lyDoGiamGia: discountNumber ? discountReason.trim() : undefined, hinhThucTT: method, tienKhachDua: method === 'tienmat' ? cashNumber : undefined, chiTiet: lines }));
    } catch (e: any) {
      if (!e?.response) {
        try { finish(await hoaDonService.getByRequestId(requestId.current)); return; }
        catch (checkError: any) {
          if (checkError?.response?.status !== 404) setError('Chưa xác định được kết quả thanh toán. Giỏ hàng vẫn được giữ; hãy kiểm tra kết nối rồi bấm thử lại.');
          else setError('Chưa tạo hóa đơn. Kiểm tra kết nối rồi bấm thử lại, hệ thống sẽ không tạo trùng.');
        }
      } else setError(getApiErrorMessage(e, 'Không thể thanh toán.'));
    } finally { setPaying(false); }
  };

  return <KeyboardAvoidingView style={styles.page} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.eyebrow}>XÁC NHẬN ĐƠN HÀNG</Text><Text style={styles.title}>Thanh toán</Text>
      {loading ? <View style={styles.loading}><ActivityIndicator color={Colors.primary} /><Text style={styles.muted}>Đang kiểm tra giá và tồn kho...</Text></View> : error && !quote ? <View style={styles.errorBox}><Text style={styles.error}>{error}</Text><Button title="Thử lại" variant="outline" onPress={loadQuote} /></View> : null}
      {quote && <>
        <View style={styles.section}><Text style={styles.sectionTitle}>Khách hàng</Text>
          <CustomerPicker value={customer} onChange={setCustomer} />
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Giảm giá thủ công</Text>
          <TextInput value={discount} onChangeText={setDiscount} keyboardType="number-pad" placeholder="0đ" style={styles.input} />
          {discountNumber > 0 && <><Text style={styles.inputLabel}>Lý do giảm giá</Text><TextInput value={discountReason} onChangeText={setDiscountReason} maxLength={255} placeholder="VD: Khách quen, hàng gần hết hạn" style={styles.input} /></>}
          <Text style={styles.help}>Để trống hoặc nhập 0 nếu hóa đơn không giảm giá.</Text>
        </View>
        <View style={styles.section}><Text style={styles.sectionTitle}>Hình thức thanh toán</Text>
          <View style={styles.methodList}>{METHODS.map((m) => <Pressable accessibilityRole="radio" accessibilityState={{ checked: method === m.key }} key={m.key} onPress={() => setMethod(m.key)} style={[styles.method, method === m.key && styles.methodActive]}>
            <Ionicons name={m.icon} size={21} color={method === m.key ? Colors.primary : Colors.textSecondary} /><Text style={styles.methodText}>{m.label}</Text><Ionicons name={method === m.key ? 'radio-button-on' : 'radio-button-off'} size={20} color={method === m.key ? Colors.primary : Colors.textMuted} />
          </Pressable>)}</View>
          {method === 'tienmat' && <><Text style={styles.inputLabel}>Tiền khách đưa</Text><TextInput value={cash} onChangeText={setCash} keyboardType="number-pad" placeholder="0" style={styles.input} /><Text style={styles.change}>Tiền thừa: {change.toLocaleString('vi-VN')}đ</Text></>}
          {method === 'chuyenkhoan' && <Text style={styles.help}>Chỉ xác nhận sau khi đã kiểm tra giao dịch thành công trên tài khoản cửa hàng.</Text>}
          {method === 'congno' && <Text style={styles.help}>Đơn sẽ được ghi nhận theo khách hàng đã chọn.</Text>}
        </View>
        <View style={styles.summary}><Summary label="Tạm tính" value={quote.tamTinh} /><Summary label="Giảm giá" value={-quote.giamGia} /><Summary label="Thuế hóa đơn" value={quote.thue} /><View style={styles.rule} /><Summary label="Tổng thanh toán" value={quote.tongTien} strong /></View>
        {!!error && <View style={styles.errorBox}><Text style={styles.error}>{error}</Text></View>}
        <Button title={paying ? 'Đang xác nhận...' : `Thanh toán ${quote.tongTien.toLocaleString('vi-VN')}đ`} size="lg" loading={paying} onPress={pay} />
        <Text style={styles.safety}>Giỏ hàng chỉ được xóa sau khi máy chủ xác nhận hóa đơn.</Text>
      </>}
    </ScrollView>
  </KeyboardAvoidingView>;
}

function Summary({ label, value, strong }: { label: string; value: number; strong?: boolean }) { return <View style={styles.summaryRow}><Text style={[styles.summaryLabel, strong && styles.strong]}>{label}</Text><Text style={[styles.summaryValue, strong && styles.total]}>{value.toLocaleString('vi-VN')}đ</Text></View>; }

function CustomerPicker({ value, onChange }: { value: KhachHang | null; onChange: (v: KhachHang | null) => void }) {
  const [visible, setVisible] = useState(false); const [q, setQ] = useState(''); const [rows, setRows] = useState<KhachHang[]>([]); const [busy, setBusy] = useState(false);
  useEffect(() => { if (!visible) return; const timer = setTimeout(async () => { setBusy(true); try { setRows(await khachHangService.search(q)); } finally { setBusy(false); } }, 280); return () => clearTimeout(timer); }, [q, visible]);
  return <><Pressable onPress={() => setVisible(true)} style={styles.customer}><Ionicons name="person-outline" size={21} color={Colors.primary} /><View style={styles.grow}><Text style={styles.customerName}>{value?.ten ?? 'Khách lẻ'}</Text><Text style={styles.muted}>{value?.sdt ?? 'Chạm để tìm khách hàng'}</Text></View><Ionicons name="chevron-forward" size={20} color={Colors.textMuted} /></Pressable>
    <Modal visible={visible} animationType="slide" onRequestClose={() => setVisible(false)}><View style={styles.modal}><View style={styles.modalHeader}><Text style={styles.modalTitle}>Chọn khách hàng</Text><Pressable accessibilityLabel="Đóng" onPress={() => setVisible(false)} style={styles.iconButton}><Ionicons name="close" size={24} color={Colors.text} /></Pressable></View><TextInput autoFocus value={q} onChangeText={setQ} placeholder="Tìm theo tên hoặc số điện thoại" style={styles.input} />
      <Pressable style={styles.customerRow} onPress={() => { onChange(null); setVisible(false); }}><Text style={styles.customerName}>Khách lẻ</Text><Text style={styles.muted}>Không lưu thông tin khách</Text></Pressable>
      {busy ? <ActivityIndicator style={{ marginTop: 24 }} color={Colors.primary} /> : <FlatList data={rows} keyExtractor={(i) => i.id} ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy khách hàng.</Text>} renderItem={({ item }) => <Pressable style={styles.customerRow} onPress={() => { onChange(item); setVisible(false); }}><Text style={styles.customerName}>{item.ten}</Text><Text style={styles.muted}>{item.sdt || 'Chưa có số điện thoại'}</Text></Pressable>} />}
    </View></Modal></>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: Colors.background }, content: { padding: 20, paddingBottom: 40 },
  eyebrow: { fontSize: 11, letterSpacing: 1.5, fontWeight: '800', color: Colors.primary }, title: { fontSize: 30, fontWeight: '900', color: Colors.text, marginTop: 4, marginBottom: 22 },
  section: { marginBottom: 24 }, sectionTitle: { fontSize: 15, fontWeight: '800', color: Colors.text, marginBottom: 10 },
  customer: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border }, grow: { flex: 1 }, customerName: { color: Colors.text, fontWeight: '800', fontSize: 15 }, muted: { color: Colors.textSecondary, fontSize: 13, marginTop: 2 },
  methodList: { gap: 8 }, method: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, backgroundColor: Colors.surface }, methodActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySoft }, methodText: { flex: 1, fontWeight: '700', color: Colors.text },
  inputLabel: { color: Colors.text, fontWeight: '700', marginTop: 16, marginBottom: 7 }, input: { minHeight: 52, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, backgroundColor: Colors.surface, color: Colors.text, fontSize: 16 }, change: { marginTop: 8, color: Colors.primary, fontWeight: '800' }, help: { color: Colors.textSecondary, lineHeight: 20, marginTop: 12 },
  summary: { padding: 16, borderRadius: 14, borderWidth: 1, borderColor: Colors.border, backgroundColor: Colors.surface, marginBottom: 18, gap: 11 }, summaryRow: { flexDirection: 'row', justifyContent: 'space-between' }, summaryLabel: { color: Colors.textSecondary }, summaryValue: { color: Colors.text, fontWeight: '700' }, rule: { height: 1, backgroundColor: Colors.border }, strong: { color: Colors.text, fontWeight: '800' }, total: { color: Colors.primary, fontSize: 20, fontWeight: '900' },
  loading: { padding: 28, alignItems: 'center', gap: 9 }, errorBox: { padding: 14, borderRadius: 12, backgroundColor: Colors.dangerSoft, gap: 12, marginBottom: 16 }, error: { color: Colors.danger, lineHeight: 20 }, safety: { textAlign: 'center', color: Colors.textMuted, fontSize: 12, marginTop: 10 },
  modal: { flex: 1, padding: 20, backgroundColor: Colors.background }, modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18, marginBottom: 18 }, modalTitle: { fontSize: 24, fontWeight: '900', color: Colors.text }, iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, customerRow: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.border }, empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 30 },
});
