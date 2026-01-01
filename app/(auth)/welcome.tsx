import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { brand } from '@/constants/Colors';
import { spacing, radius, shadows } from '@/constants/Theme';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <Text style={styles.brandName}>Living Eulogy</Text>
          <View style={styles.divider} />
          <Text style={styles.tagline}>
            Tell them what they mean to you{'\n'}
            <Text style={styles.taglineEmphasis}>while they can still hear it</Text>
          </Text>
        </View>

        {/* Value Props */}
        <View style={styles.valueProps}>
          <View style={styles.valueItem}>
            <Text style={styles.valueIcon}>💝</Text>
            <Text style={styles.valueText}>
              Write what you'd say at their funeral—but let them read it now
            </Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueIcon}>✉️</Text>
            <Text style={styles.valueText}>
              Share privately via email—no account needed for them to read
            </Text>
          </View>
          <View style={styles.valueItem}>
            <Text style={styles.valueIcon}>🔐</Text>
            <Text style={styles.valueText}>
              Keep it private, share with friends, or make it public
            </Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View style={styles.actions}>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity style={styles.primaryButton} activeOpacity={0.8}>
              <Text style={styles.primaryButtonText}>Get Started</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.8}>
              <Text style={styles.secondaryButtonText}>I already have an account</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Don't wait until it's too late.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.backgroundAlt,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    justifyContent: 'space-between',
    minHeight: height * 0.9,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  brandName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    color: brand.primary,
    textAlign: 'center',
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: brand.primary,
    marginVertical: spacing.lg,
    borderRadius: radius.full,
  },
  tagline: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
  },
  taglineEmphasis: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.text,
  },
  valueProps: {
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: brand.background,
    padding: spacing.md,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  valueIcon: {
    fontSize: 24,
  },
  valueText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: brand.text,
    lineHeight: 22,
    flex: 1,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    backgroundColor: brand.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md + 4,
    alignItems: 'center',
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    fontSize: 18,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: brand.accent,
    paddingVertical: spacing.md + 2,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.accent,
    fontSize: 16,
  },
  footer: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 14,
    color: brand.textMuted,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
