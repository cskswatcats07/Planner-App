import { useColorScheme } from 'react-native';
import { colors, moduleColors } from './colors';
import { typography, textStyles } from './typography';
import { spacing, borderRadius, hitSlop, minTouchTarget } from './spacing';
import { useResponsive, breakpoints, getResponsiveMetrics } from './responsive';

export { colors, moduleColors } from './colors';
export { typography, textStyles } from './typography';
export { spacing, borderRadius, hitSlop, minTouchTarget } from './spacing';
export { useResponsive, breakpoints, getResponsiveMetrics } from './responsive';

export type Theme = {
  colors: (typeof colors)[keyof typeof colors];
  typography: typeof typography;
  textStyles: typeof textStyles;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  isDark: boolean;
};

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? colors.dark : colors.light,
    typography,
    textStyles,
    spacing,
    borderRadius,
    isDark,
  };
}

export function useModuleColor(moduleKey: keyof typeof moduleColors) {
  return moduleColors[moduleKey];
}
