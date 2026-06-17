// app/product/[id].tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProducts } from '../../src/hooks/index';
import { useCartStore, useFavoritesStore } from '../../src/store/useStore';
import { ProductCard } from '../../src/components/product/ProductCard';
import { Button } from '../../src/components/ui/Button';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../src/theme';
import { formatCurrency } from '../../src/utils';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getProductById, getSimilarProducts } = useProducts();
  const { addItem, getItemCount } = useCartStore();
  const { isFavorite, toggleFavorite } = useFavoritesStore();

  const product = getProductById(id || '');
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.black }}>
        <EmptyState icon="cube-outline" title="Produto não encontrado" />
      </View>
    );
  }

  const similar = getSimilarProducts(product);
  const favorite = isFavorite(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity, selectedVariations);
    Alert.alert('✅ Adicionado!', `${product.name} adicionado ao carrinho.`, [
      { text: 'Continuar', style: 'cancel' },
      { text: 'Ver carrinho', onPress: () => router.push('/cart') },
    ]);
  };

  const stars = Array.from({ length: 5 }, (_, i) => i < Math.round(product.rating));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Back button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => toggleFavorite(product)}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={22}
            color={favorite ? Colors.error : Colors.white}
          />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) =>
            setImageIndex(Math.round(e.nativeEvent.contentOffset.x / width))
          }
        >
          {product.images.map((uri, i) => (
            <Image
              key={i}
              source={{ uri }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        {/* Image dots */}
        <View style={styles.imageDots}>
          {product.images.map((_, i) => (
            <View
              key={i}
              style={[styles.imageDot, imageIndex === i && styles.imageDotActive]}
            />
          ))}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category & Badges */}
          <View style={styles.badgesRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category.name}</Text>
            </View>
            {product.isNew && (
              <View style={[styles.categoryBadge, { backgroundColor: '#3498db20', borderColor: '#3498db40' }]}>
                <Text style={[styles.categoryBadgeText, { color: '#3498db' }]}>NOVO</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <View style={styles.stars}>
              {stars.map((filled, i) => (
                <Ionicons
                  key={i}
                  name={filled ? 'star' : 'star-outline'}
                  size={14}
                  color={Colors.warning}
                />
              ))}
            </View>
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.reviewCount.toLocaleString('pt-BR')} avaliações)
            </Text>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCurrency(product.price)}</Text>
            {product.originalPrice && (
              <View style={styles.discountContainer}>
                <Text style={styles.originalPrice}>
                  {formatCurrency(product.originalPrice)}
                </Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>-{product.discount}%</Text>
                </View>
              </View>
            )}
          </View>

          {/* Seller */}
          <View style={styles.sellerRow}>
            <Ionicons name="storefront-outline" size={16} color={Colors.gray400} />
            <Text style={styles.sellerName}>{product.seller.name}</Text>
            <Ionicons name="star" size={12} color={Colors.warning} />
            <Text style={styles.sellerRating}>{product.seller.rating}</Text>
          </View>

          {/* Variations */}
          {product.variations?.map((variation) => (
            <View key={variation.type} style={styles.variationSection}>
              <Text style={styles.variationTitle}>{variation.label}:</Text>
              <View style={styles.variationOptions}>
                {variation.options.map((opt) => {
                  const selected = selectedVariations[variation.type] === opt.id;
                  const isColor = variation.type === 'color';
                  return (
                    <TouchableOpacity
                      key={opt.id}
                      disabled={!opt.available}
                      onPress={() =>
                        setSelectedVariations((prev) => ({
                          ...prev,
                          [variation.type]: opt.id,
                        }))
                      }
                      style={[
                        isColor ? styles.colorOption : styles.sizeOption,
                        selected && (isColor ? styles.colorOptionSelected : styles.sizeOptionSelected),
                        !opt.available && styles.optionDisabled,
                      ]}
                    >
                      {isColor ? (
                        <View
                          style={[styles.colorSwatch, { backgroundColor: opt.value }]}
                        />
                      ) : (
                        <Text
                          style={[
                            styles.sizeText,
                            selected && { color: Colors.emerald },
                            !opt.available && { color: Colors.gray600 },
                          ]}
                        >
                          {opt.label}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}

          {/* Description */}
          <Text style={styles.sectionTitle}>Descrição</Text>
          <Text style={styles.description}>{product.description}</Text>

          {/* Similar products */}
          {similar.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Produtos similares</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.lg }}>
                {similar.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    style={{ marginLeft: Spacing.lg, marginRight: 8 }}
                  />
                ))}
              </ScrollView>
            </>
          )}

          <View style={{ height: 120 }} />
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <LinearGradient
        colors={['transparent', Colors.black]}
        style={styles.bottomBar}
      >
        <View style={styles.quantitySelector}>
          <TouchableOpacity
            onPress={() => setQuantity(Math.max(1, quantity - 1))}
            style={styles.qtyBtn}
          >
            <Ionicons name="remove" size={18} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.quantity}>{quantity}</Text>
          <TouchableOpacity
            onPress={() => setQuantity(Math.min(product.stock, quantity + 1))}
            style={styles.qtyBtn}
          >
            <Ionicons name="add" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
        <Button
          label="Adicionar ao carrinho"
          onPress={handleAddToCart}
          style={{ flex: 1 }}
          leftIcon={<Ionicons name="bag-add-outline" size={18} color={Colors.black} />}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  topBar: {
    position: 'absolute',
    top: 52,
    left: Spacing.lg,
    right: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: { width, height: width * 0.92, backgroundColor: Colors.gray800 },
  imageDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  imageDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.gray600 },
  imageDotActive: { width: 16, backgroundColor: Colors.emerald },
  content: { paddingHorizontal: Spacing.lg },
  badgesRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.emeraldMuted,
    borderWidth: 1,
    borderColor: `${Colors.emerald}40`,
  },
  categoryBadgeText: { color: Colors.emerald, fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  productName: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: 30,
    marginBottom: Spacing.sm,
    letterSpacing: -0.3,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  stars: { flexDirection: 'row', gap: 2 },
  ratingText: { color: Colors.gray400, fontSize: FontSize.sm },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.sm },
  price: { color: Colors.emerald, fontSize: 28, fontWeight: FontWeight.heavy },
  discountContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  originalPrice: { color: Colors.gray500, fontSize: FontSize.md, textDecorationLine: 'line-through' },
  discountBadge: {
    backgroundColor: Colors.emeraldMuted,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountText: { color: Colors.emerald, fontSize: 11, fontWeight: FontWeight.bold },
  sellerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.lg,
  },
  sellerName: { color: Colors.gray300, fontSize: FontSize.sm, flex: 1 },
  sellerRating: { color: Colors.warning, fontSize: FontSize.sm, fontWeight: '600' },
  variationSection: { marginBottom: Spacing.md },
  variationTitle: { color: Colors.gray300, fontSize: FontSize.sm, fontWeight: FontWeight.medium, marginBottom: 8 },
  variationOptions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  colorOption: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.darkBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  colorOptionSelected: { borderColor: Colors.emerald },
  colorSwatch: { width: '100%', height: '100%', borderRadius: 6 },
  sizeOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.darkBorder,
    backgroundColor: Colors.darkCard,
  },
  sizeOptionSelected: { borderColor: Colors.emerald, backgroundColor: Colors.emeraldMuted },
  sizeText: { color: Colors.white, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  optionDisabled: { opacity: 0.35 },
  sectionTitle: {
    color: Colors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  description: { color: Colors.gray400, fontSize: FontSize.md, lineHeight: 24 },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 32,
    paddingTop: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    overflow: 'hidden',
  },
  qtyBtn: { padding: 12 },
  quantity: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    minWidth: 32,
    textAlign: 'center',
  },
});
