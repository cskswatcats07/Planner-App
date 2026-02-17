import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import type { CategoryScore } from '../../types/assessment';

interface RadarChartProps {
  scores: CategoryScore[];
  size?: number;
}

export function RadarChart({ scores, size = 280 }: RadarChartProps) {
  const theme = useTheme();
  const center = size / 2;
  const maxRadius = size / 2 - 40;
  const angleStep = (2 * Math.PI) / scores.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = maxRadius * value;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const getLabelPoint = (index: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const radius = maxRadius + 28;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Background rings */}
      {[0.25, 0.5, 0.75, 1].map((ring) => (
        <View
          key={ring}
          style={[
            styles.ring,
            {
              width: maxRadius * 2 * ring,
              height: maxRadius * 2 * ring,
              borderRadius: maxRadius * ring,
              borderColor: theme.colors.borderLight,
              left: center - maxRadius * ring,
              top: center - maxRadius * ring,
            },
          ]}
        />
      ))}

      {/* Axis lines */}
      {scores.map((_, index) => {
        const point = getPoint(index, 1);
        const angle = (angleStep * index - Math.PI / 2) * (180 / Math.PI);
        const length = maxRadius;
        return (
          <View
            key={`axis-${index}`}
            style={[
              styles.axisLine,
              {
                width: length,
                backgroundColor: theme.colors.borderLight,
                left: center,
                top: center,
                transform: [
                  { translateX: 0 },
                  { translateY: -0.5 },
                  { rotate: `${angle}deg` },
                ],
                transformOrigin: 'left center',
              },
            ]}
          />
        );
      })}

      {/* Data bars - using individual bar indicators instead of SVG polygon */}
      {scores.map((score, index) => {
        const point = getPoint(index, score.percentage);
        const dotSize = 10;
        return (
          <View
            key={`dot-${index}`}
            style={[
              styles.dataDot,
              {
                width: dotSize,
                height: dotSize,
                borderRadius: dotSize / 2,
                backgroundColor: theme.colors.primary,
                left: point.x - dotSize / 2,
                top: point.y - dotSize / 2,
              },
            ]}
          />
        );
      })}

      {/* Connecting lines between dots */}
      {scores.map((score, index) => {
        const nextIndex = (index + 1) % scores.length;
        const p1 = getPoint(index, score.percentage);
        const p2 = getPoint(nextIndex, scores[nextIndex].percentage);
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        return (
          <View
            key={`line-${index}`}
            style={[
              styles.connectingLine,
              {
                width: length,
                backgroundColor: theme.colors.primary,
                opacity: 0.6,
                left: p1.x,
                top: p1.y - 1,
                transform: [{ rotate: `${angle}deg` }],
                transformOrigin: 'left center',
              },
            ]}
          />
        );
      })}

      {/* Fill area approximation using a semi-transparent center overlay */}
      <View
        style={[
          styles.fillOverlay,
          {
            left: center - 4,
            top: center - 4,
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: theme.colors.primary,
            opacity: 0.3,
          },
        ]}
      />

      {/* Labels */}
      {scores.map((score, index) => {
        const labelPoint = getLabelPoint(index);
        return (
          <Text
            key={`label-${index}`}
            style={[
              styles.label,
              {
                color: theme.colors.textSecondary,
                left: labelPoint.x,
                top: labelPoint.y,
              },
            ]}
            numberOfLines={1}
          >
            {score.label.length > 10
              ? score.label.substring(0, 9) + '…'
              : score.label}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignSelf: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
  },
  axisLine: {
    position: 'absolute',
    height: 1,
  },
  dataDot: {
    position: 'absolute',
    zIndex: 2,
  },
  connectingLine: {
    position: 'absolute',
    height: 2,
    zIndex: 1,
  },
  fillOverlay: {
    position: 'absolute',
    zIndex: 0,
  },
  label: {
    position: 'absolute',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    transform: [{ translateX: -30 }, { translateY: -7 }],
    width: 60,
  },
});
