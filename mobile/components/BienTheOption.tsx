import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BienThe } from '../types/SanPham';
import Colors from '../constants/colors';

interface Props {
  bienThe: BienThe;
  selected: boolean;
  onSelect: (bt: BienThe) => void;
}

export default function BienTheOption({ bienThe, selected, onSelect }: Props) {
  const hethang = bienThe.soLuongTon === 0;

  return (
    <TouchableOpacity
      style={[styles.option, selected && styles.selected, hethang && styles.hethang]}
      onPress={() => !hethang && onSelect(bienThe)}
      disabled={hethang}
      activeOpacity={0.8}
    >
      <Text style={[styles.ten, selected && styles.tenSelected]}>{bienThe.tenBienThe}</Text>
      <Text style={[styles.gia, selected && styles.tenSelected]}>
        {bienThe.giaBan.toLocaleString('vi-VN')}đ
      </Text>
      {hethang && <Text style={styles.hethangTxt}>Hết hàng</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10,
    padding: 12, minWidth: 90, alignItems: 'center', gap: 2,
  },
  selected: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  hethang:  { opacity: 0.4 },
  ten:      { fontSize: 13, fontWeight: '700', color: Colors.text },
  gia:      { fontSize: 12, color: Colors.textSecondary },
  tenSelected: { color: Colors.primary },
  hethangTxt: { fontSize: 10, color: Colors.danger, marginTop: 2 },
});
