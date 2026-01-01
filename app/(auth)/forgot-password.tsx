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
  SafeAreaView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { ArrowLeft, CheckCircle } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { validateEmail } from '@/lib/utils';
import { brand } from '@/constants/Colors';
import { spacing, radius } from '@/constants/Theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const emailError = emailTouched && email && !validateEmail(email) ? 'Please enter a valid email address' : '';

  const handleReset = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    const result = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://livingeulogy.io/reset-password',
    });

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
    } else {
      setSent(true);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.successContent}>
            <View style={styles.successIcon} accessibilityLabel="Success">
              <CheckCircle size={48} color={brand.success} strokeWidth={1.5} />
            </View>
            <Text style={styles.successTitle}>Check your email</Text>
            <Text style={styles.successText}>
              We sent a password reset link to{'\n'}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>
            <Text style={styles.successHint}>
              Didn't receive it? Check your spam folder or try again.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace('/(auth)/login')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Back to Sign In"
            >
              <Text style={styles.buttonText}>Back to Sign In</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => {
                setSent(false);
                setEmail('');
                setEmailTouched(false);
              }}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Try a different email"
            >
              <Text style={styles.retryText}>Try a different email</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={brand.text} strokeWidth={2} />
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter the email address associated with your account and we'll
              send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[
                  styles.input,
                  focusedInput === 'email' && styles.inputFocused,
                  (error || emailError) && styles.inputError,
                ]}
                placeholder="you@example.com"
                placeholderTextColor={brand.textMuted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) setError('');
                }}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => {
                  setFocusedInput(null);
                  setEmailTouched(true);
                }}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
                accessibilityLabel="Email address"
              />
              {emailError && !error ? (
                <Text style={styles.inlineError}>{emailError}</Text>
              ) : null}
            </View>

            {error ? (
              <View style={styles.errorContainer} accessibilityRole="alert">
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={loading ? 'Sending reset link' : 'Send reset link'}
              accessibilityState={{ disabled: loading }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brand.backgroundAlt,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    padding: spacing.sm,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
    color: brand.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: brand.textSecondary,
    lineHeight: 24,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: brand.text,
    marginLeft: spacing.xs,
  },
  input: {
    backgroundColor: brand.background,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    color: brand.text,
    borderWidth: 2,
    borderColor: brand.border,
  },
  inputFocused: {
    borderColor: brand.primary,
  },
  inputError: {
    borderColor: brand.error,
  },
  inlineError: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    padding: spacing.md,
    borderRadius: radius.sm,
    borderLeftWidth: 4,
    borderLeftColor: brand.error,
  },
  errorText: {
    fontFamily: 'Inter_500Medium',
    color: brand.error,
    fontSize: 14,
  },
  button: {
    backgroundColor: brand.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    fontSize: 17,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontFamily: 'Inter_400Regular',
    color: brand.textSecondary,
    fontSize: 15,
  },
  link: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.primary,
    fontSize: 15,
  },
  // Success state styles
  successContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  successIcon: {
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: brand.text,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.sm,
  },
  emailHighlight: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.primary,
  },
  successHint: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textMuted,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  retryButton: {
    marginTop: spacing.md,
    padding: spacing.sm,
  },
  retryText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 15,
    color: brand.primary,
  },
});
