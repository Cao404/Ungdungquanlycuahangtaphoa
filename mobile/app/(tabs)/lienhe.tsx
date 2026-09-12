import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '../../constants/colors';
import { APP_NAME } from '../../constants/config';

const CONTACT_ITEMS = [
  { icon: '📍', title: 'Địa chỉ', value: 'Thông tin đang được cập nhật' },
  { icon: '☎️', title: 'Điện thoại', value: 'Thông tin đang được cập nhật' },
  { icon: '✉️', title: 'Email', value: 'Thông tin đang được cập nhật' },
];

export default function LienHeScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏪</Text>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.sub}>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</Text>
      </View>

      {CONTACT_ITEMS.map((item) => (
        <View key={item.title} style={styles.card}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>{item.icon}</Text>
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardValue}>{item.value}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: 16, paddingBottom: 28 },
  header: { alignItems: 'center', paddingVertical: 24 },
  logo: { fontSize: 52 },
  title: { color: Colors.text, fontSize: 23, fontWeight: '900', marginTop: 10 },
  sub: { color: Colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 6 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: Colors.border,
  },
  iconWrap: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: Colors.primaryLight,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  icon: { fontSize: 23 },
  cardCopy: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  cardValue: { color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
});
