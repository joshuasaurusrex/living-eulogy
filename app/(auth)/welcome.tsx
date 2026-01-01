import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Link } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Heart, Send, Users } from 'lucide-react-native';
import { brand } from '@/constants/Colors';
import { spacing, radius, shadows } from '@/constants/Theme';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo & Brand */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Heart size={32} color="#fff" fill="#fff" strokeWidth={0} />
          </View>
          <Text style={styles.brandName}>Living Eulogy</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>
            Tell people what they mean to you
          </Text>
          <Text style={styles.heroSubtitle}>
            before it's too late
          </Text>
        </View>

        {/* Preview Cards */}
        <View style={styles.previewSection}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={[styles.previewAvatar, { backgroundColor: '#8B5CF6' }]}>
                <Text style={styles.previewAvatarText}>S</Text>
              </View>
              <View>
                <Text style={styles.previewAuthor}>Sarah</Text>
                <Text style={styles.previewMeta}>wrote to Mom</Text>
              </View>
            </View>
            <Text style={styles.previewContent} numberOfLines={2}>
              "You taught me that love isn't just a feeling—it's showing up, every single day..."
            </Text>
          </View>

          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <View style={[styles.previewAvatar, { backgroundColor: '#EC4899' }]}>
                <Text style={styles.previewAvatarText}>M</Text>
              </View>
              <View>
                <Text style={styles.previewAuthor}>Marcus</Text>
                <Text style={styles.previewMeta}>wrote to Dad</Text>
              </View>
            </View>
            <Text style={styles.previewContent} numberOfLines={2}>
              "I never said it enough, but you're the reason I became who I am..."
            </Text>
          </View>
        </View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Send size={18} color={brand.primary} strokeWidth={2} />
            <Text style={styles.featureText}>Private or public—you choose</Text>
          </View>
          <View style={styles.feature}>
            <Users size={18} color={brand.primary} strokeWidth={2} />
            <Text style={styles.featureText}>No signup to read</Text>
          </View>
        </View>

        {/* CTAs */}
        <View style={styles.actions}>
          <Link href="/(auth)/signup" asChild>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              accessibilityRole="button"
              accessibilityLabel="Start Writing"
            >
              <Text style={styles.primaryButtonText}>Start Writing</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/(auth)/login" asChild>
            <TouchableOpacity
              style={styles.secondaryButton}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Sign In"
            >
              <Text style={styles.secondaryButtonText}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>

        {/* Privacy Note */}
        <Text style={styles.privacyNote}>
          Your messages stay private until you choose to share
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: brand.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'web' ? spacing.xl : spacing.lg,
    paddingBottom: spacing.xl,
    justifyContent: 'space-between',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    gap: spacing.md,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: brand.text,
    letterSpacing: -0.5,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  heroTitle: {
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    color: brand.text,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 32,
    color: brand.accent,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: spacing.xs,
  },
  previewSection: {
    paddingVertical: spacing.md,
  },
  previewCard: {
    backgroundColor: brand.backgroundAlt,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  previewAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewAvatarText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  previewAuthor: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: brand.text,
  },
  previewMeta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: brand.textMuted,
  },
  previewContent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textSecondary,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  features: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: brand.textSecondary,
  },
  actions: {
    gap: spacing.sm,
  },
  primaryButton: {
    backgroundColor: brand.primaryDark,
    borderRadius: radius.full,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontFamily: 'Inter_500Medium',
    color: brand.textSecondary,
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  privacyNote: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: brand.textMuted,
    textAlign: 'center',
  },
});
