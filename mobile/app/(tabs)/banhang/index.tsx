import React, { useState, useCallback } from 'react';
import {
  View, FlatList, TextInput, StyleSheet,
  ActivityIndicator, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useFetch } from '../../../hooks/useFetch';
import { useGioHang } from '../../../hooks/useGioHang';
import SanPhamCard from '../../../components/SanPhamCard';
import { sanPhamService } from '../../../services/sanpham.service';
import { SanPham } from '../../../types/SanPham';
import Colors from '../../../constants/colors';

export { default } from '../../../components/ProductCatalogScreen';

const DANH_MUC = ['Tất cả', 'Thực phẩm', 'Đồ uống', 'Gia vị', 'Chăm sóc', 'Khác'];

export function LegacyBanHangScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  const [query, setQuery] = useState(typeof q === 'string' ? q : '');
  const [danhMuc, setDanhMuc] = useState('');
  const { soMon } = useGioHang();

  // Tự fetch lại khi query hoặc danhMuc thay đổi
  const { data, loading, error, refetch } = useFetch(
    () => sanPhamService.search(query, danhMuc === 'Tất cả' ? '' : danhMuc),
    [query, danhMuc]
  );

  const handleChonSanPham = useCallback((sp: SanPham) => {
    // Nếu chỉ có 1 biến thể → thêm thẳng, không mở modal
    if (sp.bienThes.length === 1 && sp.bienThes[0].soLuongTon > 0) {
      router.push({ pathname: '/(tabs)/banhang/chon-bien-the', params: { id: sp.id } });
    } else {
      router.push({ pathname: '/(tabs)/banhang/chon-bien-the', params: { id: sp.id } });
    }
  }, []);

  return (
    <View style={styles.container}>
      {/* Thanh tìm kiếm */}
      <TextInput
        style={styles.search}
        placeholder="🔍  Tìm tên sản phẩm..."
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {/* Bộ lọc danh mục */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.danhMucBar} contentContainerStyle={styles.danhMucContent}>
        {DANH_MUC.map((dm) => (
          <TouchableOpacity
            key={dm}
            style={[styles.chip, danhMuc === dm && styles.chipActive]}
            onPress={() => setDanhMuc(dm === 'Tất cả' ? '' : dm)}
          >
            <Text style={[styles.chipTxt, danhMuc === dm && styles.chipTxtActive]}>{dm}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Danh sách sản phẩm */}
      {loading && <ActivityIndicator style={styles.center} color={Colors.primary} size="large" />}
      {error && <Text style={styles.errorTxt}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SanPhamCard sanPham={item} onPress={handleChonSanPham} />}
          ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy sản phẩm nào</Text>}
          contentContainerStyle={{ paddingVertical: 6 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  search: {
    margin: 12, backgroundColor: Colors.surface, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11, fontSize: 14,
    borderWidth: 1, borderColor: Colors.border,
  },
  danhMucBar: { maxHeight: 42 },
  danhMucContent: { paddingHorizontal: 12, gap: 8 },
  chip: {
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7,
    backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipTxt: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  chipTxtActive: { color: Colors.white },
  center: { flex: 1 },
  errorTxt: { textAlign: 'center', color: Colors.danger, marginTop: 40 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 15 },
});
