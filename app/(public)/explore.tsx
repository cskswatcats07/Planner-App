import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useTheme, moduleColors, useResponsive } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import { APP_MODULES } from '../../constants/modules';
import type { ModuleColorKey } from '../../theme/colors';

export default function ExploreScreen() {
  const theme = useTheme();
  const responsive = useResponsive();
  const router = useRouter();
  const columns = responsive.gridColumns;
  const availableWidth =
    Math.min(responsive.width, responsive.maxContentWidth) -
    responsive.horizontalPadding * 2 -
    spacing.base * (columns - 1);
  const cardWidth = Math.max(160, availableWidth / columns);

  return (
    <SafeAreaWrapper>
      <Header title="Explore" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Tools Built For You
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Each module is designed to help with a specific daily challenge.
            Take the assessment to see which ones are recommended for you.
          </Text>
        </View>

        <View style={styles.grid}>
          {APP_MODULES.map((mod) => {
            const colorKey = mod.colorKey as ModuleColorKey;
            const color = moduleColors[colorKey]?.main ?? theme.colors.primary;
            const lightColor = moduleColors[colorKey]?.light ?? theme.colors.primaryLight;

            return (
              <Card
                key={mod.id}
                variant="elevated"
                padding="lg"
                style={[styles.moduleCard, { width: cardWidth }]}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: lightColor },
                  ]}
                >
                  <Ionicons
                    name={mod.icon as keyof typeof Ionicons.glyphMap}
                    size={28}
                    color={color}
                  />
                </View>
                <Text style={[styles.moduleName, { color: theme.colors.text }]}>
                  {mod.name}
                </Text>
                <Text
                  style={[styles.moduleDesc, { color: theme.colors.textSecondary }]}
                  numberOfLines={3}
                >
                  {mod.description}
                </Text>
                <View style={[styles.badge, { backgroundColor: theme.colors.surfaceElevated }]}>
                  <Text style={[styles.badgeText, { color: theme.colors.textTertiary }]}>
                    Coming Soon
                  </Text>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={styles.ctaSection}>
          <Text style={[styles.ctaTitle, { color: theme.colors.text }]}>
            Ready to get started?
          </Text>
          <Button
            title="Take the Assessment"
            onPress={() => router.push('/(public)/assessment')}
            variant="primary"
            size="lg"
            fullWidth
          />
          <Button
            title="Create an Account"
            onPress={() => router.push('/(auth)/signup')}
            variant="outline"
            size="md"
            fullWidth
          />
        </View>
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
    gap: spacing.sm,
    paddingTop: spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
  },
  grid: {
    gap: spacing.base,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moduleCard: {
    gap: spacing.md,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleName: {
    fontSize: 18,
    fontWeight: '600',
  },
  moduleDesc: {
    fontSize: 14,
    lineHeight: 21,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ctaSection: {
    gap: spacing.md,
    paddingTop: spacing.lg,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
