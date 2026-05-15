// app/(tabs)/favorites.tsx
import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { useFavoritesStore } from '../../src/store/useStore';
import { ProductCard } from '../../src/components/product/ProductCard';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/theme';

export default function FavoritesScreen() {
  const { favorites } = useFavoritesStore();

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
        {favorites.length > 0 && (
          <Text style={styles.count}>{favorites.length} item{favorites.length !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {favorites.length === 0 ? (
        <EmptyState
          icon="heart-outline"
          title="Nenhum favorito ainda"
          description="Salve produtos que você ama para encontrá-los facilmente"
          actionLabel="Explorar produtos"
          onAction={() => router.push('/(tabs)')}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          renderItem={({ item }) => <ProductCard product={item} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: { color: Colors.white, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, letterSpacing: -1 },
  count: { color: Colors.gray400, fontSize: FontSize.sm },
  grid: { paddingHorizontal: Spacing.lg, paddingBottom: 100 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
});
