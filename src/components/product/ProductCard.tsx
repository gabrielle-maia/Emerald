// src/components/product/ProductCard.tsx
import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Product } from '../../types';
import { Colors, BorderRadius, FontSize, FontWeight, Shadow } from '../../theme';
import { formatCurrency } from '../../utils';
import { useFavoritesStore } from '../../store/useStore';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 16 * 2 - 12) / 2;

interface ProductCardProps {
  product: Product;
  style?: object;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, style }) => {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const favorite = isFavorite(product.id);

  return (
    <TouchableOpacity
      style={[styles.card, style]}
      activeOpacity={0.92}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0] }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.discount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{product.discount}%</Text>
          </View>
        )}
        {product.isNew && !product.discount && (
          <View style={[styles.discountBadge, { backgroundColor: Colors.info }]}>
            <Text style={styles.discountText}>NOVO</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.favoriteBtn}
          onPress={(e) => {
            e.stopPropagation?.();
            toggleFavorite(product);
          }}
        >
          <Ionicons
            name={favorite ? 'heart' : 'heart-outline'}
            size={18}
            color={favorite ? Colors.error : Colors.white}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.ratingRow}>
          <Ionicons name="star" size={11} color={Colors.warning} />
          <Text style={styles.rating}>{product.rating.toFixed(1)}</Text>
          <Text style={styles.reviewCount}>({product.reviewCount.toLocaleString('pt-BR')})</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCurrency(product.price)}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>
              {formatCurrency(product.originalPrice)}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: CARD_WIDTH * 1.05,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray800,
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.emerald,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountText: {
    color: Colors.black,
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  favoriteBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: BorderRadius.full,
    padding: 6,
  },
  info: {
    padding: 10,
    gap: 4,
  },
  name: {
    color: Colors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  rating: {
    color: Colors.warning,
    fontSize: 11,
    fontWeight: FontWeight.semibold,
  },
  reviewCount: {
    color: Colors.gray500,
    fontSize: 10,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    flexWrap: 'wrap',
  },
  price: {
    color: Colors.emerald,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  originalPrice: {
    color: Colors.gray500,
    fontSize: FontSize.xs,
    textDecorationLine: 'line-through',
  },
});
