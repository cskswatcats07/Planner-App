import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../theme';
import { spacing, borderRadius, minTouchTarget } from '../../theme/spacing';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const isTabletLike = width >= 768;

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: minTouchTarget,
      paddingHorizontal: size === 'sm' ? spacing.base : size === 'lg' ? spacing.xl : spacing.lg,
      paddingVertical: size === 'sm' ? spacing.sm : size === 'lg' ? spacing.base : spacing.md,
    };

    if (fullWidth) {
      base.width = '100%';
      if (isTabletLike) {
        base.maxWidth = 460;
        base.alignSelf = 'center';
      }
    }

    switch (variant) {
      case 'primary':
        return { ...base, backgroundColor: theme.colors.primary };
      case 'secondary':
        return { ...base, backgroundColor: theme.colors.surfaceElevated };
      case 'outline':
        return {
          ...base,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
        };
      case 'ghost':
        return { ...base, backgroundColor: 'transparent' };
      default:
        return base;
    }
  };

  const getTextStyle = (): TextStyle => {
    const base: TextStyle = {
      fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
      fontWeight: '600',
    };

    switch (variant) {
      case 'primary':
        return { ...base, color: '#FFFFFF' };
      case 'secondary':
        return { ...base, color: theme.colors.text };
      case 'outline':
      case 'ghost':
        return { ...base, color: theme.colors.primary };
      default:
        return base;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        getContainerStyle(),
        disabled && styles.disabled,
        style,
      ]}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.primary}
          size="small"
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5,
  },
});
