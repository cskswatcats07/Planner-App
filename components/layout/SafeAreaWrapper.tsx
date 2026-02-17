import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive, useTheme } from '../../theme';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  constrainWidth?: boolean;
}

export function SafeAreaWrapper({
  children,
  style,
  padded = true,
  edges = ['top', 'bottom'],
  constrainWidth = true,
}: SafeAreaWrapperProps) {
  const theme = useTheme();
  const responsive = useResponsive();

  return (
    <SafeAreaView
      edges={edges}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      <View
        style={[
          styles.contentCenter,
        ]}
      >
        <View
          style={[
            styles.content,
            padded && { paddingHorizontal: responsive.horizontalPadding },
            constrainWidth && { maxWidth: responsive.maxContentWidth, width: '100%' },
          ]}
        >
          {children}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentCenter: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
  },
});
