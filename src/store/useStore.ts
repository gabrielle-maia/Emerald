// src/store/useStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Product, CartItem, Order, Notification, FilterOptions } from '../types';
import { MOCK_ORDERS, MOCK_NOTIFICATIONS } from '../constants/mockData';

// ─── AUTH STORE ────────────────────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, _password: string) => {
    // Mock login — replace with real API call
    const mockUser: User = {
      id: 'u1',
      name: 'João Silva',
      email,
      avatar: 'https://picsum.photos/seed/user1/200/200',
      phone: '+55 11 99999-9999',
      addresses: [
        {
          id: 'a1',
          label: 'Casa',
          street: 'Rua das Flores',
          number: '123',
          neighborhood: 'Jardim Europa',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          isDefault: true,
        },
      ],
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem('@emerald:user', JSON.stringify(mockUser));
    set({ user: mockUser, isAuthenticated: true });
    return true;
  },

  register: async (name: string, email: string, _password: string) => {
    const mockUser: User = {
      id: `u${Date.now()}`,
      name,
      email,
      addresses: [],
      createdAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem('@emerald:user', JSON.stringify(mockUser));
    set({ user: mockUser, isAuthenticated: true });
    return true;
  },

  logout: async () => {
    await AsyncStorage.removeItem('@emerald:user');
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (data) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...data };
    AsyncStorage.setItem('@emerald:user', JSON.stringify(updated));
    set({ user: updated });
  },

  loadUser: async () => {
    try {
      const stored = await AsyncStorage.getItem('@emerald:user');
      if (stored) {
        set({ user: JSON.parse(stored), isAuthenticated: true });
      }
    } finally {
      set({ isLoading: false });
    }
  },
}));

// ─── CART STORE ────────────────────────────────────────────────────────────────
interface CartState {
  items: CartItem[];
  coupon: string | null;
  couponDiscount: number;
  addItem: (product: Product, quantity?: number, variations?: Record<string, string>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  applyCoupon: (code: string) => boolean;
  clearCart: () => void;
  getTotal: () => number;
  getSubtotal: () => number;
  getShipping: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  coupon: null,
  couponDiscount: 0,

  addItem: (product, quantity = 1, variations) => {
    const items = get().items;
    const existing = items.find(
      (i) => i.product.id === product.id && JSON.stringify(i.selectedVariations) === JSON.stringify(variations)
    );
    if (existing) {
      set({
        items: items.map((i) =>
          i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i
        ),
      });
    } else {
      set({
        items: [
          ...items,
          { id: `cart_${Date.now()}`, product, quantity, selectedVariations: variations },
        ],
      });
    }
  },

  removeItem: (itemId) =>
    set({ items: get().items.filter((i) => i.id !== itemId) }),

  updateQuantity: (itemId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(itemId);
      return;
    }
    set({
      items: get().items.map((i) =>
        i.id === itemId ? { ...i, quantity } : i
      ),
    });
  },

  applyCoupon: (code) => {
    const validCoupons: Record<string, number> = {
      'EMERALD10': 0.1,
      'VERDE20': 0.2,
      'BEMVINDO': 0.05,
    };
    const discount = validCoupons[code.toUpperCase()];
    if (discount) {
      set({ coupon: code.toUpperCase(), couponDiscount: discount });
      return true;
    }
    return false;
  },

  clearCart: () => set({ items: [], coupon: null, couponDiscount: 0 }),

  getSubtotal: () =>
    get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),

  getShipping: () => {
    const subtotal = get().getSubtotal();
    return subtotal >= 299 ? 0 : 19.9;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const shipping = get().getShipping();
    const discount = subtotal * get().couponDiscount;
    return subtotal + shipping - discount;
  },

  getItemCount: () =>
    get().items.reduce((sum, i) => sum + i.quantity, 0),
}));

// ─── FAVORITES STORE ───────────────────────────────────────────────────────────
interface FavoritesState {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  loadFavorites: () => Promise<void>;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],

  toggleFavorite: async (product) => {
    const { favorites } = get();
    const exists = favorites.find((p) => p.id === product.id);
    const updated = exists
      ? favorites.filter((p) => p.id !== product.id)
      : [...favorites, product];
    set({ favorites: updated });
    await AsyncStorage.setItem('@emerald:favorites', JSON.stringify(updated));
  },

  isFavorite: (productId) =>
    get().favorites.some((p) => p.id === productId),

  loadFavorites: async () => {
    const stored = await AsyncStorage.getItem('@emerald:favorites');
    if (stored) set({ favorites: JSON.parse(stored) });
  },
}));

// ─── ORDERS STORE ──────────────────────────────────────────────────────────────
interface OrdersState {
  orders: Order[];
  placeOrder: (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
}

export const useOrdersStore = create<OrdersState>(() => ({
  orders: MOCK_ORDERS,
  placeOrder: (orderData) => {
    const newOrder: Order = {
      ...orderData,
      id: `EMR-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    useOrdersStore.setState((state) => ({
      orders: [newOrder, ...state.orders],
    }));
    return newOrder;
  },
}));

// ─── NOTIFICATION STORE ────────────────────────────────────────────────────────
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: MOCK_NOTIFICATIONS,
  unreadCount: MOCK_NOTIFICATIONS.filter((n) => !n.read).length,

  markAsRead: (id) => {
    const updated = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    set({ notifications: updated, unreadCount: updated.filter((n) => !n.read).length });
  },

  markAllAsRead: () => {
    set({
      notifications: get().notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },
}));

// ─── THEME STORE ───────────────────────────────────────────────────────────────
interface ThemeState {
  isDark: boolean;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDark: true,

  toggleTheme: async () => {
    const newVal = !get().isDark;
    set({ isDark: newVal });
    await AsyncStorage.setItem('@emerald:theme', newVal ? 'dark' : 'light');
  },

  loadTheme: async () => {
    const stored = await AsyncStorage.getItem('@emerald:theme');
    if (stored) set({ isDark: stored === 'dark' });
  },
}));

// ─── SEARCH STORE ──────────────────────────────────────────────────────────────
interface SearchState {
  query: string;
  history: string[];
  filters: FilterOptions;
  setQuery: (q: string) => void;
  addToHistory: (q: string) => void;
  clearHistory: () => void;
  setFilters: (f: FilterOptions) => void;
  clearFilters: () => void;
}

export const useSearchStore = create<SearchState>((set, get) => ({
  query: '',
  history: [],
  filters: {},

  setQuery: (q) => set({ query: q }),
  addToHistory: (q) => {
    if (!q.trim()) return;
    const history = [q, ...get().history.filter((h) => h !== q)].slice(0, 10);
    set({ history });
    AsyncStorage.setItem('@emerald:search_history', JSON.stringify(history));
  },
  clearHistory: () => {
    set({ history: [] });
    AsyncStorage.removeItem('@emerald:search_history');
  },
  setFilters: (f) => set({ filters: { ...get().filters, ...f } }),
  clearFilters: () => set({ filters: {} }),
}));
