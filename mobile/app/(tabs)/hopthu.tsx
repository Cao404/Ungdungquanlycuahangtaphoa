import React from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/colors';

export default function InboxScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hộp thư</Text>
        <Text style={styles.subtitle}>Tin nhắn và thông báo của bạn</Text>
      </View>

      <View style={styles.emptyState}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>✉</Text>
        </View>
        <Text style={styles.emptyTitle}>Chưa có tin nhắn</Text>
        <Text style={styles.emptyText}>Thông báo mới sẽ xuất hiện tại đây.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    backgroundColor: Colors.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { color: Colors.text, fontSize: 24, fontWeight: '900' },
  subtitle: { color: Colors.textSecondary, fontSize: 14, marginTop: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  icon: { color: Colors.primary, fontSize: 34 },
  emptyTitle: { color: Colors.text, fontSize: 19, fontWeight: '800', marginTop: 18 },
  emptyText: { color: Colors.textSecondary, fontSize: 14, marginTop: 6, textAlign: 'center' },
});
