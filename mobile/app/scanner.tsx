import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { sanPhamService } from '../services/sanpham.service';
import { getApiErrorMessage } from '../services/api';
import { useGioHangStore } from '../store/gioHangStore';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions(); const [locked, setLocked] = useState(false); const [manual, setManual] = useState('');
  const them = useGioHangStore((s) => s.them);
  const addBarcode = async (barcode: string) => {
    if (!barcode.trim() || locked) return; setLocked(true);
    try { const variant = await sanPhamService.getByBarcode(barcode.trim()); const ok = them(variant.sanPham, variant, 1); if (!ok) Alert.alert('Không đủ tồn kho', 'Sản phẩm đã đủ số lượng trong giỏ.'); else { Alert.alert('Đã thêm giỏ', `${variant.sanPham.ten} - ${variant.tenBienThe ?? `${variant.giaTri} ${variant.donVi}`}`); router.back(); } }
    catch (error: any) {
      const unknownBarcode = error?.response?.status === 404;
      Alert.alert(
        unknownBarcode ? 'Mã vạch chưa được đăng ký' : 'Không thể thêm sản phẩm',
        unknownBarcode
          ? `Mã ${barcode.trim()} chưa thuộc loại hàng nào trong cửa hàng. Hãy khai báo mã này ở trang quản trị sản phẩm rồi nhập hàng trước khi bán.`
          : getApiErrorMessage(error, 'Không thể xử lý mã vạch.'),
      );
      setLocked(false);
    }
  };
  if (!permission) return <View style={styles.center}><Text>Đang kiểm tra quyền camera...</Text></View>;
  if (!permission.granted) return <View style={styles.center}><Ionicons name="camera-outline" size={42} color={Colors.primary} /><Text style={styles.title}>Cho phép dùng camera</Text><Text style={styles.note}>Camera chỉ được dùng để quét mã vạch khi bạn mở màn hình này. Nếu không cấp quyền, hãy nhập mã thủ công.</Text><Pressable style={styles.button} onPress={requestPermission}><Text style={styles.buttonText}>Cho phép camera</Text></Pressable><View style={styles.deniedManual}><TextInput value={manual} onChangeText={setManual} placeholder="Nhập mã vạch" keyboardType="number-pad" style={styles.input} /><Pressable style={styles.manualButton} onPress={() => addBarcode(manual)}><Text style={styles.buttonText}>Thêm</Text></Pressable></View></View>;
  return <View style={styles.container}><CameraView style={styles.camera} facing="back" barcodeScannerSettings={{ barcodeTypes: ['ean13', 'ean8', 'code128', 'code39', 'upc_a', 'upc_e', 'qr'] }} onBarcodeScanned={locked ? undefined : ({ data }) => addBarcode(data)} />
    <View style={styles.overlay}><Text style={styles.hint}>Đặt mã vạch vào khung</Text></View>
    <View style={styles.manual}><Text style={styles.manualLabel}>Không quét được? Nhập mã thủ công</Text><View style={styles.row}><TextInput value={manual} onChangeText={setManual} placeholder="Mã vạch" style={styles.input} /><Pressable style={styles.manualButton} onPress={() => addBarcode(manual)}><Text style={styles.buttonText}>Thêm</Text></Pressable></View></View>
  </View>;
}
const styles = StyleSheet.create({ container: { flex: 1, backgroundColor: Colors.black }, camera: { flex: 1 }, overlay: { position: 'absolute', top: '34%', left: 28, right: 28, height: 150, borderWidth: 2, borderColor: Colors.white, borderRadius: 18, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 12 }, hint: { color: Colors.white, fontWeight: '700' }, manual: { backgroundColor: Colors.surface, padding: 20 }, manualLabel: { color: Colors.textSecondary, fontWeight: '700', marginBottom: 10 }, row: { flexDirection: 'row', gap: 10 }, deniedManual: { width: '100%', flexDirection: 'row', gap: 10, marginTop: 22 }, input: { flex: 1, minHeight: 50, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 12, color: Colors.text, backgroundColor: Colors.surface }, manualButton: { minHeight: 48, backgroundColor: Colors.primary, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', borderRadius: 12 }, buttonText: { color: Colors.white, fontWeight: '800' }, center: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }, title: { fontSize: 20, fontWeight: '800', color: Colors.text, marginTop: 14 }, note: { color: Colors.textSecondary, textAlign: 'center', lineHeight: 21, marginTop: 8 }, button: { marginTop: 22, minHeight: 48, justifyContent: 'center', backgroundColor: Colors.primary, paddingVertical: 13, paddingHorizontal: 20, borderRadius: 12 } });
