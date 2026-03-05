import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaWrapper } from '../../components/layout/SafeAreaWrapper';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { APP_MODULES } from '../../constants/modules';
import { useToolStore } from '../../store/toolStore';

export default function ToolsCustomizeScreen() {
  const theme = useTheme();
  const { preferences, hydrate, togglePinned, setHidden } = useToolStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <SafeAreaWrapper>
      <Header title="Customize Tools" showBack />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.intro, { color: theme.colors.textSecondary }]}>
          Choose which tools appear on your home screen and which ones are
          pinned to the top. Changes apply across the app.
        </Text>

        {APP_MODULES.map((mod) => {
          const pref = preferences[mod.id] ?? {};
          return (
            <Card key={mod.id} variant="outlined" padding="lg" style={styles.row}>
              <View style={styles.rowMain}>
                <Text style={[styles.name, { color: theme.colors.text }]}>
                  {mod.name}
                </Text>
                <Text
                  style={[styles.desc, { color: theme.colors.textSecondary }]}
                  numberOfLines={2}
                >
                  {mod.description}
                </Text>
              </View>
              <View style={styles.switchRow}>
                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                    Show on home
                  </Text>
                  <Switch
                    value={!pref.hidden}
                    onValueChange={(value) => setHidden(mod.id, !value)}
                  />
                </View>
                <View style={styles.switchItem}>
                  <Text style={[styles.switchLabel, { color: theme.colors.text }]}>
                    Pin to top
                  </Text>
                  <Switch
                    value={!!pref.pinned}
                    onValueChange={() => togglePinned(mod.id)}
                  />
                </View>
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.base,
    gap: spacing.md,
    paddingBottom: spacing['3xl'],
  },
  intro: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: spacing.sm,
  },
  row: {
    gap: spacing.sm,
  },
  rowMain: {
    gap: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  desc: {
    fontSize: 13,
    lineHeight: 19,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.lg,
  },
  switchItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 14,
  },
});

