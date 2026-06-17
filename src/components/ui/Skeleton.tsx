// src/components/ui/Skeleton.tsx
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius } from '../../theme';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
}) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(shimmer, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmer]);

  const opacity = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 0.9],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width: width as any, height, borderRadius, opacity },
        style,
      ]}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <View style={styles.cardSkeleton}>
    <Skeleton height={150} borderRadius={12} />
    <View style={{ padding: 10, gap: 8 }}>
      <Skeleton height={14} width="80%" />
      <Skeleton height={12} width="50%" />
      <Skeleton height={16} width="60%" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.gray700,
  },
  cardSkeleton: {
    backgroundColor: Colors.darkCard,
    borderRadius: 16,
    overflow: 'hidden',
    flex: 1,
    marginHorizontal: 4,
  },
});
