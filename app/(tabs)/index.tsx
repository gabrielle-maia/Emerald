// app/(tabs)/index.tsx
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore, useCartStore } from '../../src/store/useStore';
import { useProducts } from '../../src/hooks/index';
import { ProductCard } from '../../src/components/product/ProductCard';
import { Badge } from '../../src/components/ui/Badge';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../src/theme';
import { MOCK_CATEGORIES, MOCK_BANNERS } from '../../src/constants/mockData';
import { sleep } from '../../src/utils';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { user } = useAuthStore();
  const cartCount = useCartStore((s) => s.getItemCount());
  const { getAllProducts, getFeaturedProducts } = useProducts();
  const [refreshing, setRefreshing] = useState(false);
  const [bannerIndex, setBannerIndex] = useState(0);

  const allProducts = getAllProducts();
  const featuredProducts = getFeaturedProducts();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await sleep(1200);
    setRefreshing(false);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.emerald}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Olá, {user?.name?.split(' ')[0] || 'visitante'} 👋
            </Text>
            <Text style={styles.subGreeting}>O que você procura hoje?</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => router.push('/notifications')}
            >
              <Ionicons name="notifications-outline" size={22} color={Colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { position: 'relative' }]}
              onPress={() => router.push('/cart')}
            >
              <Ionicons name="bag-outline" size={22} color={Colors.white} />
              <Badge count={cartCount} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search-outline" size={18} color={Colors.gray500} />
          <Text style={styles.searchPlaceholder}>Buscar produtos, marcas...</Text>
        </TouchableOpacity>

        {/* Banners */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerScroll}
          onMomentumScrollEnd={(e) =>
            setBannerIndex(Math.round(e.nativeEvent.contentOffset.x / (width - 32)))
          }
        >
          {MOCK_BANNERS.map((banner) => (
            <TouchableOpacity
              key={banner.id}
              style={styles.bannerCard}
              activeOpacity={0.9}
            >
              <Image
                source={{ uri: banner.image }}
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.85)']}
                style={styles.bannerGradient}
              >
                <Text style={styles.bannerTitle}>{banner.title}</Text>
                <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
                <View style={styles.bannerCta}>
                  <Text style={styles.bannerCtaText}>{banner.action} →</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {/* Banner dots */}
        <View style={styles.bannerDots}>
          {MOCK_BANNERS.map((_, i) => (
            <View
              key={i}
              style={[styles.bannerDot, bannerIndex === i && styles.bannerDotActive]}
            />
          ))}
        </View>

        {/* Categories */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categorias</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {MOCK_CATEGORIES.map((cat) => (
            <TouchableOpacity key={cat.id} style={styles.categoryItem}>
              <View style={[styles.categoryIcon, { backgroundColor: `${cat.color}20` }]}>
                <Ionicons name={cat.icon as any} size={24} color={cat.color} />
              </View>
              <Text style={styles.categoryName}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Featured Products */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🔥 Em destaque</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuredScroll}>
          {featuredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              style={{ marginRight: 12, marginLeft: product === featuredProducts[0] ? 16 : 0 }}
            />
          ))}
        </ScrollView>

        {/* All Products Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Todos os produtos</Text>
        </View>
        <View style={styles.grid}>
          {allProducts.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              style={index % 2 === 0 ? { marginRight: 6 } : { marginLeft: 6 }}
            />
          ))}
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 60,
    paddingBottom: Spacing.md,
  },
  greeting: { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  subGreeting: { color: Colors.gray400, fontSize: FontSize.sm, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.darkCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    marginBottom: Spacing.lg,
  },
  searchPlaceholder: { color: Colors.gray500, fontSize: FontSize.md },
  bannerScroll: { marginBottom: Spacing.sm },
  bannerCard: {
    width: width - 32,
    height: 180,
    marginLeft: 16,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerImage: { width: '100%', height: '100%' },
  bannerGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  bannerTitle: {
    color: Colors.white,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  bannerSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: FontSize.sm },
  bannerCta: {
    marginTop: 8,
    backgroundColor: Colors.emerald,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  bannerCtaText: { color: Colors.black, fontSize: 12, fontWeight: '600' },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    marginBottom: Spacing.lg,
  },
  bannerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gray600 },
  bannerDotActive: { width: 16, backgroundColor: Colors.emerald },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  seeAll: { color: Colors.emerald, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  categoriesScroll: { paddingLeft: Spacing.lg, marginBottom: Spacing.lg },
  categoryItem: { alignItems: 'center', marginRight: Spacing.md, gap: 6 },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: { color: Colors.gray300, fontSize: FontSize.xs, textAlign: 'center' },
  featuredScroll: { marginBottom: Spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: 12,
  },
});
