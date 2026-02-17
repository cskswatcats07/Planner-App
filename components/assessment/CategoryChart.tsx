import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, moduleColors } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import type { CategoryScore } from '../../types/assessment';
import type { ModuleColorKey } from '../../theme/colors';

interface CategoryChartProps {
  scores: CategoryScore[];
}

export function CategoryChart({ scores }: CategoryChartProps) {
  const theme = useTheme();

  const sortedScores = [...scores].sort((a, b) => b.percentage - a.percentage);

  return (
    <View style={styles.container}>
      {sortedScores.map((score) => {
        const colorKey = score.category as ModuleColorKey;
        const color = moduleColors[colorKey]?.main ?? theme.colors.primary;

        return (
          <View key={score.category} style={styles.row}>
            <View style={styles.labelContainer}>
              <Text
                style={[styles.label, { color: theme.colors.text }]}
                numberOfLines={1}
              >
                {score.label}
              </Text>
              <Text style={[styles.percentage, { color: theme.colors.textSecondary }]}>
                {Math.round(score.percentage * 100)}%
              </Text>
            </View>
            <View
              style={[
                styles.barTrack,
                { backgroundColor: theme.colors.borderLight },
              ]}
            >
              <View
                style={[
                  styles.barFill,
                  {
                    backgroundColor: color,
                    width: `${Math.max(score.percentage * 100, 2)}%`,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.base,
  },
  row: {
    gap: spacing.xs,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  percentage: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  barTrack: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
});
