import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BienTheOption from '../../../components/BienTheOption';
import Button from '../../../components/ui/Button';
import { sanPhamService } from '../../../services/sanpham.service';
import { useGioHang } from '../../../hooks/useGioHang';
import { SanPham, BienThe } from '../../../types/SanPham';
import Colors from '../../../constants/colors';

export default function ChonBienTheScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sanPham, setSanPham] = useState<SanPham | null>(null);
  const [duocChon, setDuocChon] = useState<BienThe | null>(null);
  const { them } = useGioHang();

  useEffect(() => {
    sanPhamService.layTheoId(id).then(setSanPham);
  }, [id]);

  const handleThem = () => {
    if (!sanPham || !duocChon) return;
    them(sanPham, duocChon);
    router.back();
  };

  if (!sanPham) return <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />;

  return (
    <View style={styles.container}>
      <Text style={styles.ten}>{sanPham.ten}</Text>
      <Text style={styles.label}>Chọn biến thể:</Text>
      <ScrollView contentContainerStyle={styles.grid}>
        {sanPham.bienThe?.map(bt => (
          <BienTheOption
            key={bt.id}
            bienThe={bt}
            duocChon={duocChon?.id === bt.id}
            onChon={setDuocChon}
          />
        ))}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          title="Thêm vào giỏ"
          onPress={handleThem}
          disabled={!duocChon}
        />
        <Button title="Huỷ" variant="outline" onPress={() => router.back()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 16 },
  ten: { fontSize: 18, fontWeight: '700', color: Colors.text, marginBottom: 16 },
  label: { fontSize: 14, color: Colors.textSecondary, marginBottom: 10 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  footer: { gap: 10, marginTop: 24 },
});
