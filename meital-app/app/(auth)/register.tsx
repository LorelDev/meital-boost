import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { registerWithEmail } from '../../src/services/auth';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('שגיאה', 'יש למלא את כל השדות');
      return;
    }
    if (password !== confirm) {
      Alert.alert('שגיאה', 'הסיסמאות אינן תואמות');
      return;
    }
    if (password.length < 6) {
      Alert.alert('שגיאה', 'הסיסמה חייבת להכיל לפחות 6 תווים');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(email.trim(), password, name.trim(), phone.trim());
      router.replace('/onboarding');
    } catch (e: any) {
      let msg = 'שגיאת הרשמה';
      if (e.code === 'auth/email-already-in-use') msg = 'האימייל כבר רשום במערכת';
      if (e.code === 'auth/invalid-email') msg = 'כתובת אימייל לא תקינה';
      Alert.alert('שגיאה', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.primary, colors.primaryDark]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.textInverse} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🌟</Text>
              <Text style={styles.appName}>הרשמה לתוכנית</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>צור חשבון חדש</Text>

            {[
              { label: 'שם מלא', value: name, setter: setName, icon: 'person-outline', placeholder: 'ישראל ישראלי', type: 'default' },
              { label: 'אימייל', value: email, setter: setEmail, icon: 'mail-outline', placeholder: 'your@email.com', type: 'email-address' },
              { label: 'טלפון', value: phone, setter: setPhone, icon: 'call-outline', placeholder: '05X-XXXXXXX', type: 'phone-pad' },
            ].map((field) => (
              <View key={field.label} style={styles.inputGroup}>
                <Text style={styles.label}>{field.label}</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name={field.icon as any} size={20} color={colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textMuted}
                    value={field.value}
                    onChangeText={field.setter}
                    keyboardType={field.type as any}
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>סיסמה</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="לפחות 6 תווים"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-outline' : 'eye-off-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>אימות סיסמה</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="הזן שוב את הסיסמה"
                  placeholderTextColor={colors.textMuted}
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPass}
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                style={styles.btnGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>הירשם</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginLink} onPress={() => router.back()}>
              <Text style={styles.loginText}>
                כבר יש לך חשבון?{' '}
                <Text style={styles.loginTextBold}>התחבר</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.lg },
  header: { marginBottom: spacing.lg, marginTop: spacing.xl },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoContainer: { alignItems: 'center' },
  logoEmoji: { fontSize: 36, marginBottom: spacing.xs },
  appName: { ...typography.h2, color: colors.textInverse },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.xl,
    ...shadows.lg,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  inputGroup: { marginBottom: spacing.md },
  label: {
    ...typography.label,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'right',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
  },
  inputIcon: { marginRight: spacing.sm },
  input: {
    flex: 1,
    height: 48,
    ...typography.body,
    color: colors.text,
    textAlign: 'right',
  },
  eyeBtn: { padding: spacing.xs },
  btn: {
    borderRadius: radius.md,
    overflow: 'hidden',
    marginTop: spacing.md,
    ...shadows.md,
  },
  btnDisabled: { opacity: 0.6 },
  btnGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { ...typography.h4, color: colors.textInverse },
  loginLink: { marginTop: spacing.lg, alignItems: 'center' },
  loginText: { ...typography.body, color: colors.textSecondary },
  loginTextBold: { color: colors.primary, fontWeight: '700' },
});
