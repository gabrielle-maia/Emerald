// src/constants/mockData.ts
import { Product, Category, Banner, Notification, Order } from '../types';

// ================= CATEGORIAS =================
export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Marcenaria', icon: 'hammer', color: '#8d6e63' },
  { id: '2', name: 'Elétrica', icon: 'flash', color: '#ffc107' },
  { id: '3', name: 'Limpeza', icon: 'sparkles', color: '#03a9f4' },
  { id: '4', name: 'Informática', icon: 'laptop', color: '#3f51b5' },
  { id: '5', name: 'Beleza', icon: 'cut', color: '#e91e63' },
  { id: '6', name: 'Aulas Particulares', icon: 'book', color: '#4caf50' },
  { id: '7', name: 'Reformas', icon: 'construct', color: '#ff5722' },
  { id: '8', name: 'Fretes', icon: 'car', color: '#607d8b' },
];

// ================= SERVIÇOS =================
export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Gabriel Marceneiro',
    description:
      'Especialista em móveis planejados, montagem de armários, cozinhas e reparos em madeira. Atendimento rápido e acabamento profissional.',
    price: 250,
    images: [
      'https://randomuser.me/api/portraits/men/54.jpg',
    ],
    category: MOCK_CATEGORIES[0],
    rating: 4.9,
    reviewCount: 187,
    seller: {
      id: 'p1',
      name: 'Gabriel Souza',
      rating: 4.9,
      location: 'Brasília, DF',
    },
    stock: 1,
    tags: ['marceneiro', 'móveis', 'reparo', 'madeira'],
    isFeatured: true,
  },

  {
    id: '2',
    name: 'Carlos Eletricista',
    description:
      'Instalação elétrica residencial, troca de disjuntores, ventiladores e iluminação completa.',
    price: 180,
    images: [
      'https://randomuser.me/api/portraits/men/41.jpg',
    ],
    category: MOCK_CATEGORIES[1],
    rating: 4.8,
    reviewCount: 230,
    seller: {
      id: 'p2',
      name: 'Carlos Lima',
      rating: 4.8,
      location: 'Brasília, DF',
    },
    stock: 1,
    tags: ['eletricista', 'instalação', 'energia'],
  },

  {
    id: '3',
    name: 'Maria Diarista',
    description:
      'Limpeza residencial completa, organização de ambientes e higienização profissional.',
    price: 150,
    images: [
      'https://randomuser.me/api/portraits/women/60.jpg',
    ],
    category: MOCK_CATEGORIES[2],
    rating: 4.7,
    reviewCount: 98,
    seller: {
      id: 'p3',
      name: 'Maria Oliveira',
      rating: 4.7,
      location: 'Brasília, DF',
    },
    stock: 1,
    tags: ['limpeza', 'diarista', 'casa'],
    isFeatured: true,
  },

  {
    id: '4',
    name: 'Lucas Técnico em Informática',
    description:
      'Formatação, montagem de computadores, remoção de vírus e upgrade de hardware.',
    price: 120,
    images: [
      'https://randomuser.me/api/portraits/men/63.jpg',
    ],
    category: MOCK_CATEGORIES[3],
    rating: 4.8,
    reviewCount: 320,
    seller: {
      id: 'p4',
      name: 'Lucas Mendes',
      rating: 4.8,
      location: 'Brasília, DF',
    },
    stock: 1,
    tags: ['informática', 'pc', 'suporte'],
  },

  {
    id: '5',
    name: 'Ana Cabeleireira',
    description:
      'Cortes femininos, escova, progressiva e hidratação profissional com atendimento domiciliar.',
    price: 90,
    images: [
      'https://randomuser.me/api/portraits/women/21.jpg',
    ],
    category: MOCK_CATEGORIES[4],
    rating: 5.0,
    reviewCount: 142,
    seller: {
      id: 'p5',
      name: 'Ana Paula',
      rating: 5.0,
      location: 'Brasília, DF',
    },
    stock: 1,
    tags: ['cabelo', 'beleza', 'corte'],
  },

  {
    id: '6',
    name: 'Professor João Matemática',
    description:
      'Aulas particulares de matemática para ensino médio e concursos. Online ou presencial.',
    price: 80,
    images: [
      'https://randomuser.me/api/portraits/men/70.jpg',
    ],
    category: MOCK_CATEGORIES[5],
    rating: 4.9,
    reviewCount: 201,
    seller: {
      id: 'p6',
      name: 'João Ferreira',
      rating: 4.9,
      location: 'Brasília, DF',
    },
    stock: 1,
    tags: ['aula', 'matemática', 'reforço'],
  },
];

// ================= BANNERS =================
export const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    title: 'Encontre Profissionais Perto de Você',
    subtitle: 'Serviços rápidos e confiáveis',
    image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=1200&q=80',
    color: '#1a1a1a',
    action: 'Buscar serviços',
  },
  {
    id: '2',
    title: 'Serviços Residenciais',
    subtitle: 'Reparos, limpeza e reformas',
    image: 'https://images.unsplash.com/photo-1756027583186-a04a19e4f6ce?auto=format&fit=crop&w=1200&q=80',
    color: '#0f3d2e',
    action: 'Explorar',
  },
];

// ================= NOTIFICAÇÕES =================
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: '👷 Novo profissional disponível',
    message: 'Gabriel Marceneiro agora atende sua região!',
    type: 'news',
    read: false,
    createdAt: new Date().toISOString(),
  },
];

// ================= PEDIDOS (AGENDAMENTOS) =================
export const MOCK_ORDERS: Order[] = [
  {
    id: 'SRV-001',
    items: [
      { id: 'ci1', product: MOCK_PRODUCTS[0], quantity: 1 },
    ],
    status: 'shipped',
    total: 250,
    subtotal: 250,
    shipping: 0,
    discount: 0,
    address: {
      id: 'a1',
      label: 'Casa',
      street: 'Rua das Flores',
      number: '123',
      neighborhood: 'Centro',
      city: 'Brasília',
      state: 'DF',
      zipCode: '70000-000',
      isDefault: true,
    },
    paymentMethod: { type: 'pix', label: 'PIX' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]