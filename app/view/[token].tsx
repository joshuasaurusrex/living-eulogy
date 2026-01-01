import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { brand } from '@/constants/Colors';
import { spacing, radius, shadows } from '@/constants/Theme';
import { formatDate } from '@/lib/utils';

const { width } = Dimensions.get('window');

type Eulogy = {
  id: string;
  recipient_name: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
  profiles: {
    display_name: string;
  } | null;
};

export default function ViewEulogyScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [eulogy, setEulogy] = useState<Eulogy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchEulogy = async () => {
      if (!token) {
        if (isMounted) {
          setError('Invalid link');
          setLoading(false);
        }
        return;
      }

      const result = await supabase
        .from('eulogies')
        .select(`
          id,
          recipient_name,
          content,
          created_at,
          is_anonymous,
          profiles:author_id (
            display_name
          )
        `)
        .eq('share_token', token)
        .single();

      if (!isMounted) return;

      if (result.error || !result.data) {
        setError('Eulogy not found or link has expired');
      } else {
        setEulogy(result.data as unknown as Eulogy);
      }
      setLoading(false);
    };

    fetchEulogy();

    return () => {
      isMounted = false;
    };
  }, [token]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={brand.primary} />
        <Text style={styles.loadingText}>Loading your message...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorIcon}>💔</Text>
        <Text style={styles.errorTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
      </SafeAreaView>
    );
  }

  if (!eulogy) {
    return null;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>Living Eulogy</Text>
          <View style={styles.divider} />
          <Text style={styles.label}>A message for</Text>
          <Text style={styles.recipientName}>{eulogy.recipient_name}</Text>
        </View>

        {/* Content Card */}
        <View style={styles.card}>
          <View style={styles.quoteMarkTop}>
            <Text style={styles.quoteMark}>"</Text>
          </View>
          <Text style={styles.eulogyContent}>{eulogy.content}</Text>
          <View style={styles.quoteMarkBottom}>
            <Text style={styles.quoteMark}>"</Text>
          </View>
        </View>

        {/* Author */}
        <View style={styles.authorSection}>
          <Text style={styles.authorLabel}>With love,</Text>
          <Text style={styles.authorName}>
            {eulogy.is_anonymous ? 'Someone who cares about you' : (eulogy.profiles?.display_name || 'Someone who cares about you')}
          </Text>
          <Text style={styles.date}>{formatDate(eulogy.created_at, 'long')}</Text>
        </View>

        {/* Branding Footer */}
        <View style={styles.branding}>
          <View style={styles.brandingDivider} />
          <Text style={styles.brandingTitle}>Living Eulogy</Text>
          <Text style={styles.brandingSubtitle}>
            Share what matters, while it matters.
          </Text>
          <Text style={styles.brandingCta}>
            Want to write one for someone special?
          </Text>
          <Text style={styles.brandingUrl}>livingeulogy.io</Text>
        </View>
      </ScrollView>
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
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
    minHeight: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: brand.backgroundAlt,
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: brand.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: brand.backgroundAlt,
    padding: spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    color: brand.text,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: brand.textSecondary,
    textAlign: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: brand.primary,
    marginBottom: spacing.md,
  },
  divider: {
    width: 40,
    height: 2,
    backgroundColor: brand.primary,
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: brand.textSecondary,
    marginBottom: spacing.xs,
  },
  recipientName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: width > 400 ? 36 : 28,
    color: brand.text,
    textAlign: 'center',
  },
  card: {
    backgroundColor: brand.background,
    borderRadius: radius.xl,
    padding: spacing.xl,
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl,
    position: 'relative',
    ...shadows.lg,
  },
  quoteMarkTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.lg,
  },
  quoteMarkBottom: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.lg,
  },
  quoteMark: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 60,
    color: brand.primaryLight,
    opacity: 0.3,
    lineHeight: 60,
  },
  eulogyContent: {
    fontFamily: 'Inter_400Regular',
    fontSize: 18,
    lineHeight: 32,
    color: brand.text,
    textAlign: 'left',
    paddingHorizontal: spacing.sm,
  },
  authorSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  authorLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textMuted,
    marginBottom: spacing.xs,
  },
  authorName: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 20,
    color: brand.text,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textMuted,
  },
  branding: {
    alignItems: 'center',
    paddingTop: spacing.lg,
  },
  brandingDivider: {
    width: 60,
    height: 1,
    backgroundColor: brand.border,
    marginBottom: spacing.lg,
  },
  brandingTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 18,
    color: brand.primary,
    marginBottom: spacing.xs,
  },
  brandingSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textSecondary,
    marginBottom: spacing.lg,
  },
  brandingCta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.textMuted,
    marginBottom: spacing.xs,
  },
  brandingUrl: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: brand.accent,
  },
});
