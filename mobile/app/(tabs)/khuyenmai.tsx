import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/colors';

export default function KhuyenMaiScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <Text style={styles.heroIcon}>🎁</Text>
        <Text style={styles.heroTitle}>Khuyến mãi</Text>
        <Text style={styles.heroSub}>Các chương trình ưu đãi hấp dẫn sẽ được cập nhật tại đây.</Text>
      </View>

      <View style={styles.emptyCard}>
        <Text style={styles.emptyIcon}>🏷️</Text>
        <Text style={styles.emptyTitle}>Chưa có khuyến mãi mới</Text>
        <Text style={styles.emptyText}>Hãy quay lại sau để không bỏ lỡ những ưu đãi tốt nhất.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16 },
  hero: { backgroundColor: Colors.primaryLight, borderRadius: 16, padding: 24, alignItems: 'center' },
  heroIcon: { fontSize: 52 },
  heroTitle: { color: Colors.text, fontSize: 24, fontWeight: '900', marginTop: 10 },
  heroSub: { color: Colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 6 },
  emptyCard: {
    backgroundColor: Colors.surface, borderRadius: 14, padding: 28, alignItems: 'center',
    marginTop: 16, borderWidth: 1, borderColor: Colors.border,
  },
  emptyIcon: { fontSize: 38 },
  emptyTitle: { color: Colors.text, fontSize: 17, fontWeight: '800', marginTop: 12 },
  emptyText: { color: Colors.textSecondary, fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 6 },
});
