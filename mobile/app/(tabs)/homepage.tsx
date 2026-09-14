import React, { useState } from 'react';
import {
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { router } from 'expo-router';
import Colors from '../../constants/colors';
import { HOME_BANNER_IMAGES } from '../../constants/home';
import { useAuthStore } from '../../store/authStore';
import { useGioHangStore } from '../../store/gioHangStore';

const NAV_ITEMS = [
  { label: 'TRANG CHỦ', route: '/(tabs)' as const },
  { label: 'SẢN PHẨM', route: '/(tabs)/sanpham' as const },
  { label: 'KHUYẾN MÃI', route: '/(tabs)/khuyenmai' as const },
  { label: 'LIÊN HỆ', route: '/(tabs)/lienhe' as const },
];

interface BannerProps {
  image: ImageSourcePropType | null;
  type: 'main' | 'secondary';
  wide: boolean;
}

function Banner({ image, type, wide }: BannerProps) {
  const isMain = type === 'main';

  return (
    <TouchableOpacity
      style={[
        styles.banner,
        isMain ? styles.mainBanner : styles.secondaryBanner,
        wide && styles.wideBanner,
        wide && (isMain ? styles.wideMainBanner : styles.wideSecondaryBanner),
      ]}
      activeOpacity={0.86}
      onPress={() => router.push('/(tabs)/sanpham')}
    >
      {image ? (
        <Image source={image} style={styles.bannerImage} resizeMode="cover" />
      ) : (
        <View style={[styles.bannerPlaceholder, isMain ? styles.mainPlaceholder : styles.secondaryPlaceholder]}>
          <View style={styles.bannerCopy}>
            <Text style={styles.bannerEyebrow}>{isMain ? 'MUA SẮM TIỆN LỢI' : 'ƯU ĐÃI MỖI NGÀY'}</Text>
            <Text style={[styles.bannerTitle, !isMain && styles.secondaryTitle]}>
              {isMain ? 'Đủ món thiết yếu\ncho cả gia đình' : 'Giá tốt\nChọn dễ'}
            </Text>
            <View style={styles.shopButton}>
              <Text style={styles.shopButtonText}>Mua ngay  →</Text>
            </View>
          </View>
          <Text style={[styles.bannerEmoji, !isMain && styles.secondaryEmoji]}>
            {isMain ? '🛍️' : '🏷️'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const [query, setQuery] = useState('');
  const nguoiDung = useAuthStore((s) => s.nguoiDung);
  const soMon = useGioHangStore((s) => s.soMon());
  const wide = width >= 720;

  const handleSearch = () => {
    const q = query.trim();
    router.push(q
      ? { pathname: '/(tabs)/sanpham', params: { q } }
      : '/(tabs)/sanpham');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.menuIcon}>☰</Text>
            <Text style={styles.welcome} numberOfLines={1}>
              Xin chào, {nguoiDung?.hoTen ?? 'bạn'}!
            </Text>

            <TouchableOpacity
              style={styles.cartButton}
              onPress={() => router.push('/(tabs)/giohang')}
              activeOpacity={0.75}
            >
              <Text style={styles.cartIcon}>🛒</Text>
              {soMon > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{soMon > 99 ? '99+' : soMon}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch} activeOpacity={0.8}>
              <Text style={styles.searchButtonText}>⌕  Tìm</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.nav}
          contentContainerStyle={styles.navContent}
        >
          {NAV_ITEMS.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.navItem, index === 0 && styles.navItemActive]}
              onPress={() => router.push(item.route)}
              activeOpacity={0.7}
            >
              <Text style={[styles.navText, index === 0 && styles.navTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={[styles.bannerArea, wide && styles.bannerAreaWide]}>
          <Banner image={HOME_BANNER_IMAGES.main} type="main" wide={wide} />
          <Banner image={HOME_BANNER_IMAGES.secondary} type="secondary" wide={wide} />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionEyebrow}>KHÁM PHÁ NGAY</Text>
              <Text style={styles.sectionTitle}>Mua sắm nhanh</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/sanpham')}>
              <Text style={styles.seeAll}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickGrid}>
            {[
              { icon: '🥫', label: 'Thực phẩm' },
              { icon: '🥤', label: 'Đồ uống' },
              { icon: '🧴', label: 'Gia dụng' },
              { icon: '🍪', label: 'Ăn vặt' },
            ].map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.quickCard}
                onPress={() => router.push('/(tabs)/sanpham')}
                activeOpacity={0.78}
              >
                <Text style={styles.quickIcon}>{item.icon}</Text>
                <Text style={styles.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.businessInfo}>
          <Text style={styles.businessName}>Tạp hóa Dương Cao</Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⌖</Text>
            <View style={styles.infoCopy}>
              <Text style={styles.infoText}>
                Mã số doanh nghiệp: 0123456789 do Sở Kế hoạch và Đầu tư thành phố Hà Nội cấp lần đầu ngày 26/09/2019
              </Text>
              <Text style={styles.infoText}>
                Địa chỉ: Số 16C, phố Hoàng Diệu, Ba Đình, Hà Nội
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>☎</Text>
            <Text style={styles.contactText}>033456789</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>✉</Text>
            <Text style={styles.contactText}>taphoaduongcao.vn@gmail.com</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.primary },
  container: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.primary, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { color: Colors.white, fontSize: 26, marginRight: 12 },
  welcome: { flex: 1, color: Colors.white, fontSize: 16, fontWeight: '700' },
  cartButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  cartIcon: { fontSize: 26 },
  badge: {
    position: 'absolute', top: 0, right: 0, minWidth: 19, height: 19,
    borderRadius: 10, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.secondary, borderWidth: 1.5, borderColor: Colors.white,
  },
  badgeText: { color: Colors.white, fontSize: 10, fontWeight: '800' },
  searchRow: { flexDirection: 'row', marginTop: 14, height: 46 },
  searchInput: {
    flex: 1, backgroundColor: Colors.white, borderTopLeftRadius: 10, borderBottomLeftRadius: 10,
    paddingHorizontal: 14, color: Colors.text, fontSize: 14,
  },
  searchButton: {
    minWidth: 88, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: Colors.secondary, borderTopRightRadius: 10, borderBottomRightRadius: 10,
  },
  searchButtonText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  nav: {
    backgroundColor: Colors.surface, borderBottomWidth: 1, borderBottomColor: Colors.border,
    maxHeight: 54,
  },
  navContent: { paddingHorizontal: 8 },
  navItem: { paddingHorizontal: 14, height: 54, alignItems: 'center', justifyContent: 'center' },
  navItemActive: { borderBottomWidth: 3, borderBottomColor: Colors.primary },
  navText: { color: Colors.text, fontSize: 12, fontWeight: '700' },
  navTextActive: { color: Colors.primary },
  bannerArea: { padding: 14, gap: 12 },
  bannerAreaWide: { flexDirection: 'row' },
  banner: { borderRadius: 14, overflow: 'hidden', backgroundColor: Colors.surface },
  mainBanner: { height: 190 },
  secondaryBanner: { height: 140 },
  wideBanner: { height: 220 },
  wideMainBanner: { flex: 2 },
  wideSecondaryBanner: { flex: 1 },
  bannerImage: { width: '100%', height: '100%' },
  bannerPlaceholder: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 22,
  },
  mainPlaceholder: { backgroundColor: '#D1FAE5' },
  secondaryPlaceholder: { backgroundColor: '#FEF3C7' },
  bannerCopy: { flex: 1, zIndex: 1 },
  bannerEyebrow: { color: Colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  bannerTitle: { color: Colors.text, fontSize: 24, lineHeight: 30, fontWeight: '900', marginTop: 7 },
  secondaryTitle: { fontSize: 21, lineHeight: 27 },
  shopButton: {
    alignSelf: 'flex-start', backgroundColor: Colors.primary, borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 8, marginTop: 14,
  },
  shopButtonText: { color: Colors.white, fontSize: 12, fontWeight: '800' },
  bannerEmoji: { fontSize: 76, marginLeft: 8 },
  secondaryEmoji: { fontSize: 62 },
  section: { paddingHorizontal: 14, paddingTop: 4, paddingBottom: 28 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 12,
  },
  sectionEyebrow: { color: Colors.primary, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  sectionTitle: { color: Colors.text, fontSize: 20, fontWeight: '800', marginTop: 3 },
  seeAll: { color: Colors.primary, fontSize: 12, fontWeight: '700' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    width: '47.5%', minHeight: 92, backgroundColor: Colors.surface, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: Colors.border,
  },
  quickIcon: { fontSize: 30 },
  quickLabel: { color: Colors.text, fontSize: 13, fontWeight: '700', marginTop: 7 },
  businessInfo: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: 18,
    paddingTop: 22,
    paddingBottom: 30,
  },
  businessName: { color: Colors.text, fontSize: 18, fontWeight: '900', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  infoIcon: { width: 28, color: Colors.primary, fontSize: 20, fontWeight: '800', marginTop: -1 },
  infoCopy: { flex: 1, gap: 10 },
  infoText: { color: Colors.text, fontSize: 13, lineHeight: 20 },
  contactText: { flex: 1, color: Colors.text, fontSize: 14, lineHeight: 20 },
});
