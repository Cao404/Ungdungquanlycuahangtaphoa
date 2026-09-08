import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import Colors from '../../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'danger';
  loading?: boolean;
}

export default function Button({ title, variant = 'primary', loading, style, ...props }: ButtonProps) {
  const btnStyle = [
    styles.base,
    variant === 'outline' && styles.outline,
    variant === 'danger'  && styles.danger,
    style,
  ];
  const textStyle = [
    styles.text,
    variant === 'outline' && styles.textOutline,
  ];

  return (
    <TouchableOpacity style={btnStyle} disabled={loading || props.disabled} {...props}>
      {loading
        ? <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.white} />
        : <Text style={textStyle}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  danger: {
    backgroundColor: Colors.danger,
  },
  text: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  textOutline: {
    color: Colors.primary,
  },
});
