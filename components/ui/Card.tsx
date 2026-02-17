import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
}

export function Card({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'base',
}: CardProps) {
  const theme = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing[padding],
    ...(variant === 'elevated' && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: theme.isDark ? 0.3 : 0.08,
      shadowRadius: 8,
      elevation: 3,
    }),
    ...(variant === 'outlined' && {
      borderWidth: 1,
      borderColor: theme.colors.border,
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[cardStyle, style]}
        activeOpacity={0.7}
        accessibilityRole="button"
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}
