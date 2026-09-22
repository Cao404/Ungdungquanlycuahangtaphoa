import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useChonBienThe } from '../../hooks/useChonBienThe';
import Colors from '../../constants/colors';
import BienTheOption from '../BienTheOption';
import Button from '../ui/Button';

export default function ChonBienTheContent() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const picker = useChonBienThe(id);

  if (picker.loading) {
    return <ActivityIndicator style={styles.loading} color={Colors.primary} size="large" />;
  }
  if (picker.error) return <Text style={styles.error}>{picker.error}</Text>;
  if (!picker.sanPham) return <Text style={styles.error}>Không tìm thấy sản phẩm</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.productName}>{picker.sanPham.ten}</Text>
      <Text style={styles.label}>Chọn loại:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.variantRow}>
        {picker.sanPham.bienThe.map((item) => (
          <BienTheOption
            key={item.id}
            bienThe={item}
            selected={picker.bienTheChon?.id === item.id}
            onSelect={picker.setBienTheChon}
          />
        ))}
      </ScrollView>

      {picker.bienTheChon && (
        <View style={styles.quantityRow}>
          <Text style={styles.label}>Số lượng (còn {picker.bienTheChon.soLuongTon}):</Text>
          <TextInput
            style={styles.quantityInput}
            value={picker.soLuong}
            onChangeText={picker.setSoLuong}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        </View>
      )}

      <View style={styles.footer}>
        {picker.bienTheChon && (
          <Text style={styles.subtotal}>Tạm tính: {picker.tamTinh.toLocaleString('vi-VN')}đ</Text>
        )}
        <Button title="Thêm vào giỏ" onPress={picker.themVaoGio} disabled={!picker.bienTheChon} />
        <Button title="Quay lại" variant="outline" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  loading: { flex: 1 },
  productName: { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 20 },
  label: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', marginBottom: 10 },
  variantRow: { gap: 10, paddingBottom: 16 },
  quantityRow: { marginTop: 8, marginBottom: 16 },
  quantityInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderRadius: 10,
    padding: 12,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  subtotal: { fontSize: 16, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
  footer: { marginTop: 'auto', gap: 10 },
  error: { textAlign: 'center', color: Colors.danger, marginTop: 40 },
});
