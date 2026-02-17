import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing, borderRadius, minTouchTarget } from '../../theme/spacing';
import type { LikertValue } from '../../types/assessment';
import { likertLabels } from '../../types/assessment';

interface LikertScaleProps {
  value: LikertValue | undefined;
  onChange: (value: LikertValue) => void;
}

const options: LikertValue[] = [1, 2, 3, 4, 5];

export function LikertScale({ value, onChange }: LikertScaleProps) {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = value === option;
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.option,
              {
                backgroundColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.surface,
                borderColor: isSelected
                  ? theme.colors.primary
                  : theme.colors.border,
              },
            ]}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={likertLabels[option]}
          >
            <Text
              style={[
                styles.optionText,
                {
                  color: isSelected ? '#FFFFFF' : theme.colors.text,
                },
              ]}
            >
              {likertLabels[option]}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  option: {
    minHeight: minTouchTarget,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderRadius: borderRadius.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
