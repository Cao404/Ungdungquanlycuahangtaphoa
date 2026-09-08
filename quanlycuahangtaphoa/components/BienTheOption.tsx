import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { BienThe } from '../types/SanPham';
import Colors from '../constants/colors';

interface Props {
  bienThe: BienThe;
  duocChon: boolean;
  onChon: (bienThe: BienThe) => void;
}

export default function BienTheOption({ bienThe, duocChon, onChon }: Props) {
  return (
    <TouchableOpacity
      style={[styles.option, duocChon && styles.selected]}
      onPress={() => onChon(bienThe)}
    >
      <Text style={[styles.ten, duocChon && styles.tenSelected]}>{bienThe.ten}</Text>
      <Text style={[styles.gia, duocChon && styles.tenSelected]}>
        {bienThe.gia.toLocaleString('vi-VN')}đ
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    minWidth: 80,
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  ten: { fontSize: 13, fontWeight: '600', color: Colors.text },
  gia: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  tenSelected: { color: Colors.primary },
});
