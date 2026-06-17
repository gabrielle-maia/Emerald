// app/auth/register.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../src/store/useStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Colors, FontSize, FontWeight, Spacing } from '../../src/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { register } = useAuthStore();

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim() || name.length < 2) e.name = 'Nome deve ter no mínimo 2 caracteres';
    if (!email.includes('@')) e.email = 'Email inválido';
    if (password.length < 6) e.password = 'Senha deve ter no mínimo 6 caracteres';
    if (password !== confirmPassword) e.confirmPassword = 'As senhas não coincidem';
    if (!acceptedTerms) e.terms = 'Aceite os termos para continuar';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const success = await register(name, email, password);
      if (success) router.replace('/(tabs)');
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
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Criar conta</Text>
          <Text style={styles.subtitle}>Junte-se ao Emerald marketplace</Text>
        </View>

        <Input
          label="Nome completo"
          placeholder="Seu nome"
          value={name}
          onChangeText={setName}
          leftIcon="person-outline"
          error={errors.name}
        />
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
        <Input
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          leftIcon="lock-closed-outline"
          error={errors.password}
        />
        <Input
          label="Confirmar senha"
          placeholder="Repita sua senha"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          leftIcon="lock-closed-outline"
          error={errors.confirmPassword}
        />

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAcceptedTerms(!acceptedTerms)}
        >
          <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
            {acceptedTerms && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.termsText}>
            Aceito os{' '}
            <Text style={styles.termsLink}>Termos de Uso</Text>
            {' '}e a{' '}
            <Text style={styles.termsLink}>Política de Privacidade</Text>
          </Text>
        </TouchableOpacity>
        {errors.terms && (
          <Text style={styles.errorText}>{errors.terms}</Text>
        )}

        <Button
          label="Criar conta"
          onPress={handleRegister}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.lg }}
        />

        <View style={styles.loginRow}>
          <Text style={styles.loginLabel}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.replace('/auth/login')}>
            <Text style={styles.loginLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  content: { padding: Spacing.lg, paddingTop: 60, paddingBottom: 48 },
  backBtn: { marginBottom: Spacing.lg },
  backText: { color: Colors.emerald, fontSize: FontSize.md },
  header: { marginBottom: Spacing.xl, gap: 6 },
  title: {
    color: Colors.white,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
  subtitle: { color: Colors.gray400, fontSize: FontSize.md },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: Colors.gray500,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.emerald,
    borderColor: Colors.emerald,
  },
  checkmark: { color: Colors.black, fontSize: 12, fontWeight: '700' },
  termsText: { flex: 1, color: Colors.gray400, fontSize: FontSize.sm, lineHeight: 20 },
  termsLink: { color: Colors.emerald },
  errorText: { color: Colors.error, fontSize: FontSize.xs, marginTop: 4 },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  loginLabel: { color: Colors.gray400, fontSize: FontSize.md },
  loginLink: { color: Colors.emerald, fontSize: FontSize.md, fontWeight: FontWeight.semibold },
});
