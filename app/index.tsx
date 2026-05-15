// app/index.tsx
import { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/useStore';
import { Colors } from '../src/theme';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const scaleAnim = new Animated.Value(0.7);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!isLoading) {
        if (isAuthenticated) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/onboarding');
        }
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoContainer,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>💎</Text>
        </View>
        <Text style={styles.logoText}>emerald</Text>
        <Text style={styles.tagline}>marketplace premium</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: Colors.emeraldMuted,
    borderWidth: 1,
    borderColor: Colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 48,
  },
  logoText: {
    color: Colors.white,
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
  },
  tagline: {
    color: Colors.emerald,
    fontSize: 13,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontWeight: '500',
  },
});
