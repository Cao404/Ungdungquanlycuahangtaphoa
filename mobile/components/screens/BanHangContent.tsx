import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSanPhamSearch } from '../../hooks/useSanPhamSearch';
import Colors from '../../constants/colors';
import SanPhamCard from '../SanPhamCard';

export default function BanHangContent() {
  const search = useSanPhamSearch();

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Tìm tên hoặc thương hiệu sản phẩm..."
        value={search.query}
        onChangeText={search.setQuery}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryContent}
      >
        {search.danhMucs.map((item) => (
          <TouchableOpacity
            key={item}
            style={[styles.chip, search.danhMuc === item && styles.chipActive]}
            onPress={() => search.chonDanhMuc(item)}
          >
            <Text style={[styles.chipText, search.danhMuc === item && styles.chipTextActive]}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {search.loading && <ActivityIndicator style={styles.center} color={Colors.primary} size="large" />}
      {search.error && <Text style={styles.error}>{search.error}</Text>}
      {!search.loading && !search.error && (
        <FlatList
          data={search.sanPhams}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <SanPhamCard sanPham={item} onPress={search.chonSanPham} />}
          ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy sản phẩm nào</Text>}
          contentContainerStyle={styles.list}
          onRefresh={search.refetch}
          refreshing={search.loading}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  search: {
    margin: 12,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBar: { maxHeight: 42 },
  categoryContent: { paddingHorizontal: 12, gap: 8 },
  chip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  chipText: { fontSize: 13, color: Colors.text, fontWeight: '600' },
  chipTextActive: { color: Colors.white },
  center: { flex: 1 },
  list: { paddingVertical: 6, flexGrow: 1 },
  error: { textAlign: 'center', color: Colors.danger, marginTop: 40 },
  empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: 15 },
});
