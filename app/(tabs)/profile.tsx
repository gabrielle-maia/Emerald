// app/(tabs)/profile.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuthStore, useThemeStore } from '../../src/store/useStore';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '../../src/theme';

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  iconColor?: string;
  right?: React.ReactNode;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onPress,
  iconColor = Colors.gray400,
  right,
  danger = false,
}) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.menuIconContainer, { backgroundColor: `${iconColor}18` }]}>
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Text style={[styles.menuLabel, danger && { color: Colors.error }]}>{label}</Text>
    <View style={styles.menuRight}>
      {right || <Ionicons name="chevron-forward" size={18} color={Colors.gray600} />}
    </View>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  const handleLogout = async () => {
    await logout();
    router.replace('/auth/login');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Perfil</Text>
        </View>

        {/* User Info */}
        <View style={styles.userCard}>
          <Image
            source={{
              uri: user?.avatar || `https://picsum.photos/seed/${user?.id}/200/200`,
            }}
            style={styles.avatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.userEmail}>{user?.email || ''}</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil-outline" size={18} color={Colors.emerald} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Pedidos', value: '2', icon: '📦' },
            { label: 'Favoritos', value: '3', icon: '❤️' },
            { label: 'Avaliações', value: '5', icon: '⭐' },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <Text style={styles.statEmoji}>{stat.icon}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Account */}
        <Text style={styles.sectionLabel}>CONTA</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="person-outline"
            label="Editar perfil"
            iconColor="#3498db"
            onPress={() => {}}
          />
          <MenuItem
            icon="location-outline"
            label="Meus endereços"
            iconColor="#e67e22"
            onPress={() => {}}
          />
          <MenuItem
            icon="card-outline"
            label="Formas de pagamento"
            iconColor="#9b59b6"
            onPress={() => {}}
          />
          <MenuItem
            icon="receipt-outline"
            label="Meus pedidos"
            iconColor={Colors.emerald}
            onPress={() => router.push('/(tabs)/orders')}
          />
        </View>

        {/* Preferences */}
        <Text style={styles.sectionLabel}>PREFERÊNCIAS</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="moon-outline"
            label="Modo escuro"
            iconColor="#8e44ad"
            onPress={() => {}}
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: Colors.gray700, true: Colors.emerald }}
                thumbColor={Colors.white}
              />
            }
          />
          <MenuItem
            icon="notifications-outline"
            label="Notificações"
            iconColor="#e74c3c"
            onPress={() => {}}
          />
          <MenuItem
            icon="language-outline"
            label="Idioma"
            iconColor="#1abc9c"
            onPress={() => {}}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionLabel}>SUPORTE</Text>
        <View style={styles.menuGroup}>
          <MenuItem
            icon="help-circle-outline"
            label="Central de ajuda"
            iconColor="#f39c12"
            onPress={() => {}}
          />
          <MenuItem
            icon="shield-outline"
            label="Privacidade"
            iconColor="#27ae60"
            onPress={() => {}}
          />
          <MenuItem
            icon="information-circle-outline"
            label="Sobre o Emerald"
            iconColor={Colors.gray400}
            onPress={() => {}}
          />
        </View>

        <View style={styles.menuGroup}>
          <MenuItem
            icon="log-out-outline"
            label="Sair da conta"
            onPress={handleLogout}
            danger
          />
        </View>

        <Text style={styles.version}>Emerald v1.0.0 • Feito com 💚</Text>
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  header: { paddingTop: 60, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.md },
  title: { color: Colors.white, fontSize: FontSize.xxxl, fontWeight: FontWeight.bold, letterSpacing: -1 },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.darkCard,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    ...Shadow.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: Colors.gray700,
    borderWidth: 2,
    borderColor: Colors.emerald,
  },
  userInfo: { flex: 1, marginLeft: Spacing.md },
  userName: { color: Colors.white, fontSize: FontSize.lg, fontWeight: FontWeight.semibold },
  userEmail: { color: Colors.gray400, fontSize: FontSize.sm, marginTop: 2 },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.emeraldMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 3,
  },
  statEmoji: { fontSize: 20 },
  statValue: { color: Colors.white, fontSize: FontSize.xl, fontWeight: FontWeight.bold },
  statLabel: { color: Colors.gray400, fontSize: FontSize.xs },
  sectionLabel: {
    color: Colors.gray600,
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    letterSpacing: 1.2,
    marginLeft: Spacing.lg,
    marginBottom: 6,
    marginTop: Spacing.lg,
  },
  menuGroup: {
    backgroundColor: Colors.darkCard,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.darkBorder,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.darkBorder,
    gap: Spacing.sm,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: { flex: 1, color: Colors.white, fontSize: FontSize.md },
  menuRight: { marginLeft: 'auto' },
  version: {
    textAlign: 'center',
    color: Colors.gray600,
    fontSize: FontSize.xs,
    marginTop: Spacing.xl,
  },
});
