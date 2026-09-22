import React from 'react';
import {
  TouchableOpacity, Text, ActivityIndicator,
  StyleSheet, TouchableOpacityProps,
} from 'react-native';
import Colors from '../../constants/colors';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'outline' | 'danger' | 'ghost';
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  title, variant = 'primary', loading, size = 'md', style, ...props
}: ButtonProps) {
  const btnStyles = [
    styles.base,
    styles[size],
    variant === 'outline' && styles.outline,
    variant === 'danger'  && styles.danger,
    variant === 'ghost'   && styles.ghost,
    (loading || props.disabled) && styles.disabled,
    style,
  ];
  const textStyles = [
    styles.text,
    size === 'sm' && styles.textSm,
    (variant === 'outline' || variant === 'ghost') && styles.textOutline,
    variant === 'danger' && styles.textDanger,
  ];

  return (
    <TouchableOpacity
      style={btnStyles}
      disabled={loading || props.disabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      {...props}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? Colors.white : Colors.primary} size="small" />
        : <Text style={textStyles}>{title}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base:    { borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary },
  sm:      { paddingVertical: 8,  paddingHorizontal: 16 },
  md:      { paddingVertical: 13, paddingHorizontal: 24 },
  lg:      { paddingVertical: 16, paddingHorizontal: 32 },
  outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
  danger:  { backgroundColor: Colors.danger },
  ghost:   { backgroundColor: 'transparent' },
  disabled:{ opacity: 0.5 },
  text:    { color: Colors.white, fontWeight: '700', fontSize: 15 },
  textSm:  { fontSize: 13 },
  textOutline: { color: Colors.primary },
  textDanger:  { color: Colors.white },
});
