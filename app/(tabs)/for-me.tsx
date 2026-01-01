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
import { Heart } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { brand } from '@/constants/Colors';
import { spacing, radius } from '@/constants/Theme';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

const Separator = () => <View style={styles.separator} />;

const EmptyInbox = ({ email }: { email?: string }) => (
  <View style={styles.emptyContainer}>
    <EmptyState
      type="inbox"
      title="No messages yet"
      description="Messages sent to your email will appear here"
    />
    <View style={styles.tipContainer}>
      <Text style={styles.tipText}>
        Your email is{' '}
        <Text style={styles.tipEmail}>{email}</Text>
        {'\n'}Share it with people you'd love to hear from.
      </Text>
    </View>
  </View>
);

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

export default function ForMeScreen() {
  const { user } = useAuth();
  const [eulogies, setEulogies] = useState<Eulogy[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchEulogies = useCallback(async (isMounted?: { current: boolean }) => {
    if (!user?.email) return;

    try {
      const { data, error } = await supabase
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
        .eq('recipient_email', user.email)
        .order('created_at', { ascending: false });

      if (isMounted && !isMounted.current) return;

      if (error) {
        console.error('Failed to fetch eulogies:', error);
        setEulogies([]);
      } else {
        setEulogies(data as unknown as Eulogy[]);
      }
    } catch (err) {
      console.error('Failed to fetch eulogies:', err);
      if (!isMounted || isMounted.current) setEulogies([]);
    } finally {
      if (!isMounted || isMounted.current) setLoading(false);
    }
  }, [user?.email]);

  useFocusEffect(
    useCallback(() => {
      const isMounted = { current: true };
      fetchEulogies(isMounted);
      return () => {
        isMounted.current = false;
      };
    }, [fetchEulogies])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchEulogies();
    setRefreshing(false);
  };

  const renderEulogy = ({ item }: { item: Eulogy }) => {
    const authorName = item.is_anonymous ? 'Someone special' : (item.profiles?.display_name || 'Someone special');

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Avatar name={item.is_anonymous ? '?' : authorName} size="md" />
          <View style={styles.headerText}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.date}>{formatDate(item.created_at, 'long')}</Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.content}>{item.content}</Text>

        {/* Received indicator */}
        <View style={styles.receivedBadge}>
          <Heart size={14} color={brand.error} fill={brand.error} strokeWidth={0} />
          <Text style={styles.receivedText}>Received with love</Text>
        </View>
      </View>
    );
  };

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
        ListEmptyComponent={!loading ? <EmptyInbox email={user?.email} /> : null}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>For You</Text>
            {eulogies.length > 0 && (
              <Text style={styles.headerSubtitle}>
                {eulogies.length} {eulogies.length === 1 ? 'message' : 'messages'}
              </Text>
            )}
          </View>
        }
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={Separator}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: brand.background,
  },
  list: {
    flexGrow: 1,
  },
  headerContainer: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  header: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    color: brand.text,
  },
  headerSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textMuted,
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: brand.border,
  },
  card: {
    backgroundColor: brand.background,
    padding: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  authorName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: brand.text,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.textMuted,
    marginTop: 2,
  },
  content: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: brand.text,
    lineHeight: 26,
    marginBottom: spacing.md,
  },
  receivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.sm,
  },
  receivedText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  tipContainer: {
    backgroundColor: '#EEF2FF',
    padding: spacing.md,
    borderRadius: radius.md,
    maxWidth: 300,
    marginTop: spacing.md,
  },
  tipText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tipEmail: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.primary,
  },
});
