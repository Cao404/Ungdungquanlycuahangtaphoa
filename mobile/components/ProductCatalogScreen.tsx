import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Colors from '../constants/colors';
import { CATALOG_PRODUCTS, CatalogProduct } from '../constants/products';
import { useGioHang } from '../hooks/useGioHang';
import type { SanPham } from '../types/SanPham';

const FILTERS = ['Tất cả', 'Thực phẩm', 'Đồ uống', 'Giặt xả', 'Gia dụng'];

function ProductCard({
  product,
  added,
  onAdd,
}: {
  product: CatalogProduct;
  added: boolean;
  onAdd: (product: CatalogProduct) => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.imageFrame}>
        {product.image ? (
          <Image source={product.image} style={styles.productImage} resizeMode="contain" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderIcon}>{product.fallbackIcon}</Text>
            <Text style={styles.placeholderText}>Thêm ảnh sản phẩm</Text>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.price}>{product.price.toLocaleString('vi-VN')}đ</Text>

        <TouchableOpacity
          style={[styles.addButton, added && styles.addButtonDone]}
          onPress={() => onAdd(product)}
          activeOpacity={0.78}
        >
          <Text style={styles.addButtonText}>{added ? 'Đã thêm ✓' : 'Thêm vào giỏ'}</Text>
          <View style={styles.cartCircle}>
            <Text style={styles.cartIcon}>🛒</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ProductCatalogScreen() {
  const { themSanPham } = useGioHang();
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('Tất cả');
  const [query, setQuery] = useState('');
  const [addedId, setAddedId] = useState<string | null>(null);

  const products = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('vi-VN');

    return CATALOG_PRODUCTS.filter((product) => {
      const matchesFilter = filter === 'Tất cả' || product.category === filter;
      const matchesQuery = !normalizedQuery
        || product.name.toLocaleLowerCase('vi-VN').includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [filter, query]);

  const handleAdd = (product: CatalogProduct) => {
    const sanPham: SanPham = {
      id: product.id,
      ten: product.name,
      danhMuc: product.category,
      bienThes: [{
        id: `${product.id}-mac-dinh`,
        sanPhamId: product.id,
        tenBienThe: '1 sản phẩm',
        giaBan: product.price,
        donViTinh: 'sản phẩm',
        soLuongTon: 999,
      }],
    };

    themSanPham(sanPham, sanPham.bienThes[0]);
    setAddedId(product.id);
    setTimeout(() => setAddedId((current) => current === product.id ? null : current), 1200);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Tìm kiếm sản phẩm..."
            placeholderTextColor={Colors.textMuted}
            autoCapitalize="none"
            clearButtonMode="while-editing"
          />
        </View>

        <View style={styles.toolbar}>
          <TouchableOpacity
            style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters((current) => !current)}
            activeOpacity={0.75}
          >
            <Text style={styles.filterIcon}>▽</Text>
            <Text style={[styles.filterButtonText, showFilters && styles.filterButtonTextActive]}>Bộ lọc</Text>
          </TouchableOpacity>

          <Text style={styles.pageTitle}>TẤT CẢ SẢN PHẨM</Text>
          <View style={styles.toolbarSpacer} />
        </View>

        {showFilters && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterBar}
            contentContainerStyle={styles.filterContent}
          >
            {FILTERS.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.filterChip, filter === item && styles.filterChipActive]}
                onPress={() => setFilter(item)}
              >
                <Text style={[styles.filterChipText, filter === item && styles.filterChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard product={item} added={addedId === item.id} onAdd={handleAdd} />
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.surface },
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  searchWrap: {
    height: 50,
    marginHorizontal: 12,
    marginTop: 10,
    marginBottom: 10,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
  },
  searchIcon: { color: Colors.textSecondary, fontSize: 24, marginRight: 8 },
  searchInput: { flex: 1, color: Colors.text, fontSize: 15, paddingVertical: 0 },
  toolbar: {
    minHeight: 72,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    width: 86,
    height: 42,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: Colors.surface,
  },
  filterButtonActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  filterIcon: { color: Colors.text, fontSize: 18, transform: [{ rotate: '180deg' }] },
  filterButtonText: { color: Colors.text, fontSize: 13, fontWeight: '700' },
  filterButtonTextActive: { color: Colors.primary },
  pageTitle: { flex: 1, color: Colors.text, textAlign: 'center', fontSize: 16, fontWeight: '900' },
  toolbarSpacer: { width: 86 },
  filterBar: {
    flexGrow: 0,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  filterChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 18,
    paddingHorizontal: 13,
    paddingVertical: 7,
    backgroundColor: Colors.surface,
  },
  filterChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  filterChipText: { color: Colors.textSecondary, fontSize: 12, fontWeight: '700' },
  filterChipTextActive: { color: Colors.white },
  productList: { padding: 10, paddingBottom: 28 },
  productRow: { gap: 10, marginBottom: 10 },
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  imageFrame: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  productImage: { width: '100%', height: '100%' },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FAFAFA' },
  placeholderIcon: { fontSize: 50 },
  placeholderText: { color: Colors.textMuted, fontSize: 10, marginTop: 8 },
  cardBody: { flex: 1, padding: 10 },
  productName: {
    minHeight: 38,
    color: Colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  price: { color: '#EF2626', fontSize: 16, fontWeight: '800', textAlign: 'center', marginVertical: 9 },
  addButton: {
    height: 42,
    borderRadius: 22,
    paddingLeft: 14,
    paddingRight: 4,
    backgroundColor: '#EF2626',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addButtonDone: { backgroundColor: Colors.success },
  addButtonText: { flex: 1, color: Colors.white, fontSize: 11, fontWeight: '800', textAlign: 'center' },
  cartCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartIcon: { fontSize: 16 },
});
