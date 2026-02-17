import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useResponsive, useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { minTouchTarget } from '../../theme/spacing';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  rightAction?: {
    icon: keyof typeof Ionicons.glyphMap;
    onPress: () => void;
    accessibilityLabel: string;
  };
}

export function Header({ title, showBack = false, rightAction }: HeaderProps) {
  const theme = useTheme();
  const responsive = useResponsive();
  const router = useRouter();
  const slotSize = responsive.isTablet ? 56 : 48;

  return (
    <View
      style={[
        styles.container,
        {
          borderBottomColor: theme.colors.border,
          paddingHorizontal: responsive.horizontalPadding,
          paddingVertical: responsive.isTablet ? spacing.lg : spacing.md,
        },
      ]}
    >
      <View style={[styles.slot, { width: slotSize }]}>
        {showBack && (
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="chevron-back"
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      <Text
        style={[
          styles.title,
          {
            color: theme.colors.text,
            fontSize: responsive.isTablet ? 20 : 18,
          },
        ]}
        numberOfLines={1}
        accessibilityRole="header"
      >
        {title}
      </Text>

      <View style={[styles.slot, { width: slotSize, alignItems: 'flex-end' }]}>
        {rightAction && (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.iconButton}
            accessibilityRole="button"
            accessibilityLabel={rightAction.accessibilityLabel}
          >
            <Ionicons
              name={rightAction.icon}
              size={24}
              color={theme.colors.text}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  slot: {
    width: 48,
    alignItems: 'flex-start',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  iconButton: {
    width: minTouchTarget,
    height: minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
