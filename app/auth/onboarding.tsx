// app/auth/onboarding.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../src/theme';
import { Button } from '../../src/components/ui/Button';

const { width, height } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    emoji: '🛍️',
    title: 'Compre com\nconfiança',
    subtitle: 'Produtos verificados de vendedores confiáveis, com garantia em todas as compras.',
    color: Colors.emerald,
  },
  {
    id: '2',
    emoji: '🚀',
    title: 'Entrega\nultra-rápida',
    subtitle: 'Receba seus produtos em tempo recorde com rastreamento em tempo real.',
    color: '#3498db',
  },
  {
    id: '3',
    emoji: '💎',
    title: 'Qualidade\npremium',
    subtitle: 'Os melhores produtos curadoriados para você. Experiência de compra sem igual.',
    color: '#9b59b6',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const goNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      router.replace('/auth/login');
    }
  };

  const goToLogin = () => router.replace('/auth/login');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <TouchableOpacity style={styles.skipBtn} onPress={goToLogin}>
        <Text style={styles.skipText}>Pular</Text>
      </TouchableOpacity>

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        onMomentumScrollEnd={(e) => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide]}>
            <View style={[styles.emojiContainer, { backgroundColor: `${item.color}20` }]}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <View style={[styles.emojiGlow, { backgroundColor: item.color }]} />
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.subtitle}</Text>
          </View>
        )}
      />

      {/* Dots */}
      <View style={styles.dotsContainer}>
        {SLIDES.map((_, index) => {
          const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.4, 1, 0.4],
            extrapolate: 'clamp',
          });
          return (
            <Animated.View
              key={index}
              style={[styles.dot, { width: dotWidth, opacity }]}
            />
          );
        })}
      </View>

      <View style={styles.btnContainer}>
        <Button
          label={currentIndex === SLIDES.length - 1 ? 'Começar agora' : 'Próximo'}
          onPress={goNext}
          fullWidth
          size="lg"
        />
        {currentIndex === SLIDES.length - 1 && (
          <TouchableOpacity onPress={goToLogin} style={{ marginTop: Spacing.md }}>
            <Text style={styles.loginLink}>
              Já tem conta? <Text style={{ color: Colors.emerald }}>Entrar</Text>
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  skipBtn: {
    position: 'absolute',
    top: 56,
    right: Spacing.lg,
    zIndex: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  skipText: {
    color: Colors.gray400,
    fontSize: FontSize.md,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 100,
    gap: Spacing.lg,
  },
  emojiContainer: {
    width: 160,
    height: 160,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
    position: 'relative',
  },
  emojiGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    opacity: 0.12,
    bottom: -10,
  },
  emoji: {
    fontSize: 80,
  },
  title: {
    color: Colors.white,
    fontSize: 36,
    fontWeight: FontWeight.heavy,
    textAlign: 'center',
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: Colors.gray400,
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.emerald,
  },
  btnContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 48,
    alignItems: 'center',
  },
  loginLink: {
    color: Colors.gray400,
    fontSize: FontSize.md,
  },
});
