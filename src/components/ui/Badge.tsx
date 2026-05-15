// src/components/ui/Badge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '../../theme';

interface BadgeProps {
  count: number;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({ count, size = 'md' }) => {
  if (count <= 0) return null;
  return (
    <View style={[styles.badge, size === 'sm' && styles.badgeSm]}>
      <Text style={[styles.text, size === 'sm' && styles.textSm]}>
        {count > 99 ? '99+' : count}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: Colors.dark,
  },
  badgeSm: {
    minWidth: 14,
    height: 14,
    top: -4,
    right: -4,
  },
  text: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  textSm: {
    fontSize: 8,
  },
});
