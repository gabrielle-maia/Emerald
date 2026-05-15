// app/_layout.tsx
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore, useFavoritesStore, useThemeStore } from '../src/store/useStore';

export default function RootLayout() {
  const { loadUser, isAuthenticated, isLoading } = useAuthStore();
  const { loadFavorites } = useFavoritesStore();
  const { loadTheme } = useThemeStore();

  useEffect(() => {
    Promise.all([loadUser(), loadFavorites(), loadTheme()]);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="auth" />
        <Stack.Screen
          name="product/[id]"
          options={{ animation: 'slide_from_right' }}
        />
        <Stack.Screen
          name="cart/index"
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="checkout/index"
          options={{ animation: 'slide_from_right' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}
