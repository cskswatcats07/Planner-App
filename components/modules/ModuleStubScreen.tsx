import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaWrapper } from '../layout/SafeAreaWrapper';
import { Header } from '../layout/Header';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useTheme, moduleColors } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import type { ModuleColorKey } from '../../theme/colors';

interface ModuleStubScreenProps {
  title: string;
  subtitle: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  colorKey: ModuleColorKey;
}

export function ModuleStubScreen({
  title,
  subtitle,
  description,
  icon,
  colorKey,
}: ModuleStubScreenProps) {
  const theme = useTheme();
  const accent = moduleColors[colorKey];

  return (
    <SafeAreaWrapper>
      <Header title={title} showBack />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card
          padding="lg"
          style={[
            styles.hero,
            {
              backgroundColor: theme.isDark ? theme.colors.surface : accent.light,
              borderColor: accent.main,
            },
          ]}
          variant="outlined"
        >
          <View style={[styles.iconWrap, { backgroundColor: accent.main }]}>
            <Ionicons name={icon} size={26} color="#FFFFFF" />
          </View>
          <View style={styles.heroText}>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          </View>
        </Card>

        <Card variant="outlined" padding="lg">
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>What this module will include</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>{description}</Text>
        </Card>

        <Card variant="outlined" padding="lg">
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Foundation status</Text>
          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            This module is part of the foundation MVP and is currently in coming-soon mode.
          </Text>
        </Card>

        <Button title="Coming Soon" onPress={() => {}} disabled variant="secondary" fullWidth />
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.lg,
    paddingBottom: spacing['3xl'],
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    borderWidth: 1.5,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroText: {
    flex: 1,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
  },
});
