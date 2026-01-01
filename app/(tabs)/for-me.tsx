import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { brand } from '@/constants/Colors';
import { spacing, radius, shadows } from '@/constants/Theme';

type Eulogy = {
  id: string;
  recipient_name: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
  } | null;
};

export default function ForMeScreen() {
  const { user } = useAuth();
  const [eulogies, setEulogies] = useState<Eulogy[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEulogiesForMe = async () => {
    if (!user?.email) return;

    const { data, error } = await supabase
      .from('eulogies')
      .select(`
        id,
        recipient_name,
        content,
        created_at,
        profiles (
          display_name
        )
      `)
      .eq('recipient_email', user.email)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEulogies(data as unknown as Eulogy[]);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEulogiesForMe();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEulogiesForMe();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEulogy = ({ item }: { item: Eulogy }) => (
    <View style={styles.card}>
      <View style={styles.cardAccent} />
      <View style={styles.cardContent}>
        <Text style={styles.from}>
          From {item.profiles?.display_name || 'Someone special'}
        </Text>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💌</Text>
      <Text style={styles.emptyTitle}>No eulogies for you yet</Text>
      <Text style={styles.emptySubtitle}>
        When someone writes a eulogy for you and{'\n'}shares it with your email, it will appear here.
      </Text>
      <View style={styles.tipContainer}>
        <Text style={styles.tipLabel}>Tip</Text>
        <Text style={styles.tipText}>
          Share your email with people who might want to write something special for you.
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={eulogies}
        renderItem={renderEulogy}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brand.primary}
          />
        }
        ListEmptyComponent={!loading ? EmptyState : null}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>For You</Text>
            <Text style={styles.headerSubtitle}>
              {eulogies.length > 0
                ? `${eulogies.length} ${eulogies.length === 1 ? 'message' : 'messages'} of appreciation`
                : 'Messages of appreciation from people who care'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brand.backgroundAlt,
  },
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  headerContainer: {
    marginBottom: spacing.lg,
  },
  header: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 28,
    color: brand.text,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textSecondary,
  },
  card: {
    backgroundColor: brand.background,
    borderRadius: radius.lg,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    overflow: 'hidden',
    ...shadows.lg,
  },
  cardAccent: {
    width: 5,
    backgroundColor: brand.primary,
  },
  cardContent: {
    flex: 1,
    padding: spacing.lg,
  },
  from: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: brand.primary,
    marginBottom: spacing.md,
  },
  content: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: brand.text,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: brand.textMuted,
    textAlign: 'right',
    fontStyle: 'italic',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl * 2,
    paddingHorizontal: spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 22,
    color: brand.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: brand.textSecondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipContainer: {
    backgroundColor: brand.background,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: brand.accent,
    maxWidth: 300,
  },
  tipLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: brand.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  tipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textSecondary,
    lineHeight: 20,
  },
});
