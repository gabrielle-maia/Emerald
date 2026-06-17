// src/theme/colors.ts
export const Colors = {
  // Brand
  emerald: '#2ecc71',
  emeraldDark: '#27ae60',
  emeraldLight: '#a8f0c6',
  emeraldMuted: 'rgba(46,204,113,0.15)',

  // Neutrals
  black: '#0a0a0a',
  dark: '#111111',
  darkCard: '#1a1a1a',
  darkBorder: '#2a2a2a',
  gray900: '#1c1c1e',
  gray800: '#2c2c2e',
  gray700: '#3a3a3c',
  gray600: '#48484a',
  gray500: '#636366',
  gray400: '#8e8e93',
  gray300: '#aeaeb2',
  gray200: '#c7c7cc',
  gray100: '#e5e5ea',
  gray50: '#f2f2f7',
  white: '#ffffff',

  // Semantic
  success: '#2ecc71',
  warning: '#f39c12',
  error: '#e74c3c',
  info: '#3498db',

  // Light theme
  light: {
    background: '#f8f9fa',
    surface: '#ffffff',
    border: '#e5e5ea',
    text: '#0a0a0a',
    textSecondary: '#636366',
    card: '#ffffff',
  },

  // Dark theme
  dark_theme: {
    background: '#0a0a0a',
    surface: '#1a1a1a',
    border: '#2a2a2a',
    text: '#ffffff',
    textSecondary: '#8e8e93',
    card: '#1a1a1a',
  },
};

export type ColorTheme = {
  background: string;
  surface: string;
  border: string;
  text: string;
  textSecondary: string;
  card: string;
};
