// src/types/index.ts

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  addresses: Address[];
  createdAt: string;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: Category;
  rating: number;
  reviewCount: number;
  seller: Seller;
  stock: number;
  variations?: Variation[];
  tags: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  discount?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  productCount?: number;
}

export interface Seller {
  id: string;
  name: string;
  avatar?: string;
  rating: number;
  location: string;
}

export interface Variation {
  type: 'size' | 'color' | 'material';
  label: string;
  options: VariationOption[];
}

export interface VariationOption {
  id: string;
  label: string;
  value: string;
  available: boolean;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedVariations?: Record<string, string>;
}

export interface Order {
  id: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  address: Address;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  trackingCode?: string;
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'pix' | 'boleto';
  label: string;
  last4?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'promo' | 'order' | 'news';
  read: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  color: string;
  action: string;
}

export interface FilterOptions {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
}
