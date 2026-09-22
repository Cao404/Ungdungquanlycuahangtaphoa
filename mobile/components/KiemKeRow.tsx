import { StyleSheet, Text, TextInput, View } from 'react-native';
import { KiemKeProductRow } from '../types/KiemKe';
import Colors from '../constants/colors';

interface Props {
  row: KiemKeProductRow;
  value: string;
  onChangeText: (value: string) => void;
}

export default function KiemKeRow({ row, value, onChangeText }: Props) {
  const actual = value.trim() === '' ? null : Number(value);
  const difference = actual !== null && Number.isInteger(actual)
    ? actual - row.bienThe.soLuongTon
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{row.sanPhamTen}</Text>
        <Text style={styles.variant}>{row.bienThe.tenBienThe}</Text>
        <Text style={styles.system}>Trên hệ thống: {row.bienThe.soLuongTon}</Text>
        {difference !== null && <Text style={[styles.difference, difference !== 0 && styles.warning]}>
          Chênh lệch: {difference > 0 ? '+' : ''}{difference}
        </Text>}
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        placeholder="Thực tế"
        accessibilityLabel={`Tồn thực tế ${row.sanPhamTen} ${row.bienThe.tenBienThe}`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.surface, padding: 14, borderRadius: 12, marginBottom: 10, flexDirection: 'row', gap: 12, alignItems: 'center' },
  info: { flex: 1 },
  name: { color: Colors.text, fontWeight: '700', fontSize: 15 },
  variant: { color: Colors.textSecondary, marginTop: 3 },
  system: { color: Colors.textSecondary, marginTop: 6, fontSize: 12 },
  difference: { color: Colors.success, marginTop: 3, fontSize: 12 },
  warning: { color: Colors.danger },
  input: { width: 90, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, padding: 8, textAlign: 'center', color: Colors.text },
});
