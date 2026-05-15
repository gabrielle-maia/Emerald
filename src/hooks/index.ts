// src/hooks/useProducts.ts
import { useState, useCallback, useMemo } from 'react';
import { Product, FilterOptions } from '../types';
import { MOCK_PRODUCTS } from '../constants/mockData';

export const useProducts = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllProducts = useCallback((): Product[] => {
    return MOCK_PRODUCTS;
  }, []);

  const getProductById = useCallback((id: string): Product | undefined => {
    return MOCK_PRODUCTS.find((p) => p.id === id);
  }, []);

  const getFeaturedProducts = useCallback((): Product[] => {
    return MOCK_PRODUCTS.filter((p) => p.isFeatured);
  }, []);

  const getNewProducts = useCallback((): Product[] => {
    return MOCK_PRODUCTS.filter((p) => p.isNew);
  }, []);

  const searchProducts = useCallback((query: string, filters?: FilterOptions): Product[] => {
    let results = MOCK_PRODUCTS;

    if (query.trim()) {
      const q = query.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (filters?.category) {
      results = results.filter((p) => p.category.id === filters.category);
    }
    if (filters?.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters?.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters?.minRating !== undefined) {
      results = results.filter((p) => p.rating >= filters.minRating!);
    }

    if (filters?.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          results = [...results].sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          results = [...results].sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results = [...results].sort((a, b) => b.rating - a.rating);
          break;
        case 'popular':
          results = [...results].sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    return results;
  }, []);

  const getSimilarProducts = useCallback((product: Product): Product[] => {
    return MOCK_PRODUCTS.filter(
      (p) => p.id !== product.id && p.category.id === product.category.id
    ).slice(0, 6);
  }, []);

  return {
    loading,
    error,
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getNewProducts,
    searchProducts,
    getSimilarProducts,
  };
};

// src/hooks/useTheme.ts
import { useThemeStore } from '../store/useStore';
import { Colors, ColorTheme } from '../theme/colors';

export const useTheme = () => {
  const { isDark } = useThemeStore();
  const theme: ColorTheme = isDark ? Colors.dark_theme : Colors.light;
  return { isDark, theme, colors: Colors };
};

// src/hooks/useDebounce.ts


export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// src/hooks/useToast.ts


export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const hide = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, hide };
};
