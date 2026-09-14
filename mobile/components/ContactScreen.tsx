import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '../constants/colors';

type ContactKind = 'messenger' | 'zalo' | 'phone';

const CONTACT_ITEMS: { kind: ContactKind; title: string; value: string }[] = [
  { kind: 'messenger', title: 'Messenger', value: 'Thông tin đang được cập nhật' },
  { kind: 'zalo', title: 'Zalo', value: 'Thông tin đang được cập nhật' },
  { kind: 'phone', title: 'Điện thoại', value: 'Thông tin đang được cập nhật' },
];

function ContactIcon({ kind }: { kind: ContactKind }) {
  if (kind === 'zalo') {
    return (
      <View style={[styles.brandIcon, styles.zaloIcon]}>
        <Text style={styles.zaloText}>Zalo</Text>
      </View>
    );
  }

  if (kind === 'messenger') {
    return (
      <View style={[styles.brandIcon, styles.messengerIcon]}>
        <Text style={styles.messengerMark}>⚡</Text>
      </View>
    );
  }

  return (
    <View style={[styles.brandIcon, styles.phoneIcon]}>
      <Text style={styles.phoneMark}>☎</Text>
    </View>
  );
}

export default function ContactScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.logo}>🏪</Text>
        <Text style={styles.title}>Tạp hóa Dương Cao</Text>
        <Text style={styles.sub}>Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn.</Text>
      </View>

      {CONTACT_ITEMS.map((item) => (
        <View key={item.title} style={styles.card}>
          <View style={styles.iconWrap}>
            <ContactIcon kind={item.kind} />
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
    width: 52, height: 52,
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  brandIcon: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  messengerIcon: { borderRadius: 22, backgroundColor: '#168AFF' },
  messengerMark: { color: Colors.white, fontSize: 23, fontWeight: '900' },
  zaloIcon: { borderRadius: 12, backgroundColor: '#0068FF' },
  zaloText: { color: Colors.white, fontSize: 13, fontWeight: '900', letterSpacing: -0.5 },
  phoneIcon: { borderRadius: 22, backgroundColor: Colors.primary },
  phoneMark: { color: Colors.white, fontSize: 23, fontWeight: '800' },
  cardCopy: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 15, fontWeight: '800' },
  cardValue: { color: Colors.textSecondary, fontSize: 13, marginTop: 3 },
});
