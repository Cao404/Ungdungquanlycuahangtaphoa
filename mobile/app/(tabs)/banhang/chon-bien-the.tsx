import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BienTheOption from '../../../components/BienTheOption';
import Button from '../../../components/ui/Button';
import { useChonBienThe } from '../../../hooks/useChonBienThe';
import Colors from '../../../constants/colors';

export default function ChonBienTheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    sanPham,
    loading,
    error,
    bienTheChon,
    setBienTheChon,
    soLuong,
    setSoLuong,
    tamTinh,
    themVaoGio,
  } = useChonBienThe(id);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} size="large" />;
  if (error) return <Text style={styles.errorTxt}>{error}</Text>;
  if (!sanPham) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.ten}>{sanPham.ten}</Text>

      <Text style={styles.label}>Chọn loại:</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.bienTheRow}>
        {sanPham.bienThes.map((bt) => (
          <BienTheOption
            key={bt.id}
            bienThe={bt}
            selected={bienTheChon?.id === bt.id}
            onSelect={setBienTheChon}
          />
        ))}
      </ScrollView>

      {/* Nhập số lượng */}
      {bienTheChon && (
        <View style={styles.slRow}>
          <Text style={styles.label}>Số lượng (còn {bienTheChon.soLuongTon}):</Text>
          <TextInput
            style={styles.slInput}
            value={soLuong}
            onChangeText={setSoLuong}
            keyboardType="number-pad"
            selectTextOnFocus
          />
        </View>
      )}

      <View style={styles.footer}>
        {bienTheChon && (
          <Text style={styles.tamTinh}>
            Tạm tính: {tamTinh.toLocaleString('vi-VN')}đ
          </Text>
        )}
        <Button title="Thêm vào giỏ" onPress={themVaoGio} disabled={!bienTheChon} />
        <Button title="Quay lại" variant="outline" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  ten:   { fontSize: 20, fontWeight: '800', color: Colors.text, marginBottom: 20 },
  label: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600', marginBottom: 10 },
  bienTheRow: { gap: 10, paddingBottom: 16 },
  slRow: { marginTop: 8, marginBottom: 16 },
  slInput: {
    backgroundColor: Colors.surface, borderWidth: 1.5, borderColor: Colors.primary,
    borderRadius: 10, padding: 12, fontSize: 18, fontWeight: '700',
    textAlign: 'center', marginTop: 8,
  },
  tamTinh: { fontSize: 16, fontWeight: '700', color: Colors.primary, textAlign: 'center' },
  footer: { marginTop: 'auto', gap: 10 },
  errorTxt: { textAlign: 'center', color: Colors.danger, marginTop: 40 },
});
