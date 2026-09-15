import React from 'react';
import {
  View, FlatList, TextInput, StyleSheet,
  ActivityIndicator, Text, ScrollView, TouchableOpacity,
} from 'react-native';
import SanPhamCard from '../../../components/SanPhamCard';
import { DANH_MUC, useSanPhamSearch } from '../../../hooks/useSanPhamSearch';
import Colors from '../../../constants/colors';

export default function BanHangScreen() {
  const {
    query,
    setQuery,
    danhMuc,
    chonDanhMuc,
    sanPhams,
    loading,
    error,
    chonSanPham,
  } = useSanPhamSearch();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="🔍  Tìm tên sản phẩm..."
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.danhMucBar} contentContainerStyle={styles.danhMucContent}>
        {DANH_MUC.map((dm) => (
          <TouchableOpacity
            key={dm}
            style={[styles.chip, danhMuc === dm && styles.chipActive]}
            onPress={() => chonDanhMuc(dm)}
          >
            <Text style={[styles.chipTxt, danhMuc === dm && styles.chipTxtActive]}>{dm}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading && <ActivityIndicator style={styles.center} color={Colors.primary} size="large" />}
      {error && <Text style={styles.errorTxt}>{error}</Text>}
      {!loading && !error && (
        <FlatList
          data={sanPhams}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SanPhamCard sanPham={item} onPress={chonSanPham} />}
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
