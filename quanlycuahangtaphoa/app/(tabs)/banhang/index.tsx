import React, { useEffect, useState } from 'react';
import { View, FlatList, TextInput, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import SanPhamCard from '../../components/SanPhamCard';
import { sanPhamService } from '../../services/sanpham.service';
import { useGioHang } from '../../hooks/useGioHang';
import { SanPham } from '../../types/SanPham';
import Colors from '../../constants/colors';

export default function BanHangScreen() {
  const [danhSach, setDanhSach] = useState<SanPham[]>([]);
  const [tuKhoa, setTuKhoa] = useState('');
  const [dangTai, setDangTai] = useState(false);
  const { them } = useGioHang();

  useEffect(() => {
    (async () => {
      setDangTai(true);
      try {
        const data = await sanPhamService.layDanhSach();
        setDanhSach(data);
      } catch { /* xử lý lỗi sau */ }
      finally { setDangTai(false); }
    })();
  }, []);

  const handleChon = (sp: SanPham) => {
    if (sp.bienThe && sp.bienThe.length > 0) {
      // Có biến thể → mở modal chọn biến thể
      router.push({ pathname: '/(tabs)/banhang/chon-bien-the', params: { id: sp.id } });
    } else {
      them(sp);
    }
  };

  const filtered = danhSach.filter(sp =>
    sp.ten.toLowerCase().includes(tuKhoa.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="🔍  Tìm sản phẩm..."
        value={tuKhoa}
        onChangeText={setTuKhoa}
      />
      {dangTai
        ? <ActivityIndicator style={{ flex: 1 }} color={Colors.primary} />
        : filtered.length === 0
          ? <Text style={styles.empty}>Không có sản phẩm</Text>
          : (
            <FlatList
              data={filtered}
              numColumns={2}
              keyExtractor={item => item.id}
              renderItem={({ item }) => <SanPhamCard sanPham={item} onThem={handleChon} />}
              contentContainerStyle={styles.list}
            />
          )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  search: {
    margin: 12, backgroundColor: Colors.surface,
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border, fontSize: 14,
  },
  list: { paddingHorizontal: 6, paddingBottom: 16 },
  empty: { textAlign: 'center', marginTop: 60, color: Colors.textMuted, fontSize: 15 },
});
