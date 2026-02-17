import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from './SafeAreaWrapper';
import { Header } from './Header';
import { Card } from '../ui/Card';
import { useTheme, moduleColors } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import type { ModuleColorKey } from '../../theme/colors';

interface ModuleStubScreenProps {
  moduleId: string;
  name: string;
  description: string;
  icon: string;
  colorKey: ModuleColorKey;
  features?: string[];
}

export function ModuleStubScreen({
  moduleId,
  name,
  description,
  icon,
  colorKey,
  features = [],
}: ModuleStubScreenProps) {
  const theme = useTheme();
  const colors = moduleColors[colorKey];

  return (
    <SafeAreaWrapper>
      <Header title={name} showBack />
      <ScrollView
        accessibilityLabel={`${moduleId}-module-screen`}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.light },
            ]}
          >
            <Ionicons
              name={icon as keyof typeof Ionicons.glyphMap}
              size={48}
              color={colors.main}
            />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            {name}
          </Text>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>

        <Card
          variant="outlined"
          padding="lg"
          style={[styles.comingSoon, { borderColor: colors.main }]}
        >
          <View
            style={[
              styles.badge,
              { backgroundColor: colors.light },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.dark }]}>
              Coming Soon
            </Text>
          </View>
          <Text style={[styles.comingSoonText, { color: theme.colors.textSecondary }]}>
            We're building this module with care. It will be available in a
            future update.
          </Text>
        </Card>

        {features.length > 0 && (
          <View style={styles.featureSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              What to Expect
            </Text>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureRow}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={colors.main}
                />
                <Text style={[styles.featureText, { color: theme.colors.text }]}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  hero: {
    alignItems: 'center',
    gap: spacing.base,
    paddingTop: spacing['2xl'],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    paddingHorizontal: spacing.base,
  },
  comingSoon: {
    alignItems: 'center',
    gap: spacing.md,
  },
  badge: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  comingSoonText: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  featureSection: {
    gap: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  featureText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
});
