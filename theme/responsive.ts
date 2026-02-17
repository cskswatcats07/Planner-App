import { useWindowDimensions } from 'react-native';

export const breakpoints = {
  tablet: 768,
  desktop: 1024,
} as const;

export interface ResponsiveMetrics {
  width: number;
  isTablet: boolean;
  isDesktop: boolean;
  horizontalPadding: number;
  maxContentWidth: number;
  authMaxWidth: number;
  gridColumns: number;
}

export function getResponsiveMetrics(width: number): ResponsiveMetrics {
  const isTablet = width >= breakpoints.tablet;
  const isDesktop = width >= breakpoints.desktop;

  const horizontalPadding = isDesktop ? 32 : isTablet ? 24 : 16;
  const maxContentWidth = isDesktop ? 1040 : isTablet ? 860 : 720;
  const authMaxWidth = isDesktop ? 520 : isTablet ? 460 : 9999;
  const gridColumns = isDesktop ? 4 : isTablet ? 3 : 2;

  return {
    width,
    isTablet,
    isDesktop,
    horizontalPadding,
    maxContentWidth,
    authMaxWidth,
    gridColumns,
  };
}

export function useResponsive(): ResponsiveMetrics {
  const { width } = useWindowDimensions();
  return getResponsiveMetrics(width);
}
