// app/(tabs)/search.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { useSearchStore } from '../../src/store/useStore';
import { useDebounce } from '../../src/hooks/useDebounce';
import { productService } from '../../src/services/api';
import { Product } from '../../src/types';

import { ProductCard } from '../../src/components/product/ProductCard';
import { Input } from '../../src/components/ui/Input';
import { EmptyState } from '../../src/components/ui/EmptyState';

import {
  Colors,
  FontSize,
  FontWeight,
  Spacing,
  BorderRadius,
} from '../../src/theme';

import { MOCK_CATEGORIES } from '../../src/constants/mockData';

/* ======================================================
   SEARCH SCREEN
====================================================== */

export default function SearchScreen() {
  const {
    query,
    setQuery,
    history,
    addToHistory,
    clearHistory,
  } = useSearchStore();

  const [localQuery, setLocalQuery] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(localQuery, 400);

  /* ======================================================
     API SEARCH
  ====================================================== */

  useEffect(() => {
    let active = true;

    const search = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);

        const response = await productService.search(
          debouncedQuery
        );

        if (!active) return;

        setResults(response.data);

        addToHistory(debouncedQuery);
      } catch (err) {
        console.warn('[SEARCH ERROR]', err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();

    return () => {
      active = false;
    };
  }, [debouncedQuery]);

  /* ======================================================
     HANDLERS
  ====================================================== */

  const handleSearch = (text: string) => {
    setLocalQuery(text);
    setQuery(text);
  };

  const handleHistoryItem = (item: string) => {
    setLocalQuery(item);
    setQuery(item);
  };

  const handleClear = () => {
    setLocalQuery('');
    setQuery('');
    setResults([]);
  };

  /* ======================================================
     RENDER
  ====================================================== */

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Buscar</Text>

        <Input
          placeholder="Buscar produtos, marcas, categorias..."
          value={localQuery}
          onChangeText={handleSearch}
          leftIcon="search-outline"
          rightIcon={
            localQuery ? 'close-circle' : undefined
          }
          onRightIconPress={handleClear}
        />
      </View>

      {/* CATEGORY CHIPS */}
      {!localQuery.trim() && (
        <View style={styles.chipsContainer}>
          {MOCK_CATEGORIES.slice(0, 6).map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.chip,
                { borderColor: `${cat.color}50` },
              ]}
              onPress={() => handleSearch(cat.name)}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={cat.color}
              />

              <Text
                style={[
                  styles.chipText,
                  { color: cat.color },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* HISTORY */}
      {!localQuery.trim() && history.length > 0 && (
        <View style={styles.historySection}>
          <View style={styles.historyHeader}>
            <Text style={styles.sectionTitle}>
              Buscas recentes
            </Text>

            <TouchableOpacity onPress={clearHistory}>
              <Text style={styles.clearText}>
                Limpar
              </Text>
            </TouchableOpacity>
          </View>

          {history.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyItem}
              onPress={() =>
                handleHistoryItem(item)
              }
            >
              <Ionicons
                name="time-outline"
                size={16}
                color={Colors.gray500}
              />

              <Text style={styles.historyText}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* RESULTS */}
      {localQuery.trim() && (
        <>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={Colors.emerald}
              />
            </View>
          ) : results.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="Nenhum resultado"
              description={`Não encontramos produtos para "${localQuery}"`}
            />
          ) : (
            <>
              <Text style={styles.resultsCount}>
                {results.length} resultado
                {results.length !== 1 ? 's' : ''}{' '}
                para "{localQuery}"
              </Text>

              <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.grid}
                renderItem={({ item }) => (
                  <ProductCard product={item} />
                )}
                showsVerticalScrollIndicator={false}
              />
            </>
          )}
        </>
      )}

      {/* EMPTY */}
      {!localQuery.trim() &&
        history.length === 0 && (
          <EmptyState
            icon="search-outline"
            title="Busque o que quiser"
            description="Encontre produtos incríveis no Emerald marketplace"
          />
        )}
    </View>
  );
}

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },

  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },

  title: {
    color: Colors.white,
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -1,
  },

  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: 8,
    marginBottom: Spacing.lg,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    backgroundColor: Colors.darkCard,
  },

  chipText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  historySection: {
    paddingHorizontal: Spacing.lg,
  },

  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },

  sectionTitle: {
    color: Colors.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },

  clearText: {
    color: Colors.emerald,
    fontSize: FontSize.sm,
  },

  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBorder,
  },

  historyText: {
    color: Colors.gray300,
    fontSize: FontSize.md,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  resultsCount: {
    color: Colors.gray400,
    fontSize: FontSize.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  grid: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 120,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
});