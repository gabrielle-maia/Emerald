// app/auth/login.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/useStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius } from '../../src/theme';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false); // ✅ NOVO
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { login } = useAuthStore();

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email.trim() || !email.includes('@'))
      newErrors.email = 'Email inválido';

    if (password.length < 6)
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      await login(email, password, remember); // ✅ PASSA remember
      router.replace('/(tabs)');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoEmoji}>💎</Text>
          </View>

          <Text style={styles.title}>Bem-vindo de volta</Text>
          <Text style={styles.subtitle}>Entre na sua conta Emerald</Text>
        </View>

        {/* EMAIL */}
        <Input
          label="Email"
          placeholder="seu@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          leftIcon="mail-outline"
          error={errors.email}
        />

        {/* SENHA */}
        <Input
          label="Senha"
          placeholder="••••••••"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon="lock-closed-outline"
          error={errors.password}
        />

        {/* ✅ LEMBRAR SENHA */}
        <View style={styles.rememberRow}>
          <Text style={styles.rememberText}>Lembrar senha</Text>

          <Switch
            value={remember}
            onValueChange={setRemember}
            trackColor={{
              false: Colors.gray700,
              true: Colors.emerald,
            }}
            thumbColor={Colors.white}
          />
        </View>

        {/* ESQUECI SENHA */}
        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() => router.push('/auth/forgotpassword')}
        >
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {/* BOTÃO LOGIN */}
        <Button
          label="Entrar"
          onPress={handleLogin}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.md }}
        />

        {/* REGISTER */}
        <View style={styles.registerRow}>
          <Text style={styles.registerLabel}>Não tem conta? </Text>

          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },

  content: {
    padding: Spacing.lg,
    paddingTop: 72,
    paddingBottom: 48,
  },

  header: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: Colors.emeraldMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },

  logoEmoji: { fontSize: 36 },

  title: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },

  subtitle: {
    color: Colors.gray400,
    fontSize: FontSize.md,
  },

  rememberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },

  rememberText: {
    color: Colors.white,
    fontSize: FontSize.sm,
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },

  forgotText: {
    color: Colors.emerald,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.xl,
  },

  registerLabel: {
    color: Colors.gray400,
    fontSize: FontSize.md,
  },

  registerLink: {
    color: Colors.emerald,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
