import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  Share,
  Platform,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/ui/Toast';
import { brand } from '@/constants/Colors';
import { spacing, radius } from '@/constants/Theme';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { getBaseUrl, formatDate } from '@/lib/utils';

const Separator = () => <View style={styles.separator} />;

const EmptyFeed = ({ onWritePress }: { onWritePress: () => void }) => (
  <View style={styles.emptyContainer}>
    <EmptyState
      type="feed"
      title="No stories yet"
      description="Be the first to share appreciation with the world"
    />
    <TouchableOpacity
      style={styles.writeButton}
      onPress={onWritePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Write a Eulogy"
    >
      <Text style={styles.writeButtonText}>Write a Eulogy</Text>
    </TouchableOpacity>
  </View>
);

type Eulogy = {
  id: string;
  recipient_name: string;
  content: string;
  created_at: string;
  share_token: string;
  is_anonymous: boolean;
  profiles: {
    display_name: string;
  } | null;
  likes_count: number;
  comments_count: number;
  user_has_liked: boolean;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [eulogies, setEulogies] = useState<Eulogy[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pendingLikes, setPendingLikes] = useState<Set<string>>(new Set());

  const fetchEulogies = useCallback(async (isMounted?: { current: boolean }) => {
    // Fetch eulogies first to get IDs
    const { data: eulogiesData, error } = await supabase
      .from('eulogies')
      .select(`
        id,
        recipient_name,
        content,
        created_at,
        share_token,
        is_anonymous,
        profiles:author_id (
          display_name
        )
      `)
      .eq('visibility', 'public')
      .order('created_at', { ascending: false })
      .limit(20);

    if (isMounted && !isMounted.current) return;

    if (error || !eulogiesData) {
      setLoading(false);
      return;
    }

    const eulogyIds = eulogiesData.map(e => e.id);

    // Skip counts if no eulogies
    if (eulogyIds.length === 0) {
      setEulogies([]);
      setLoading(false);
      return;
    }

    // Fetch likes, user likes, and comments in parallel
    const [likesResult, userLikesResult, commentsResult] = await Promise.all([
      supabase.from('likes').select('eulogy_id').in('eulogy_id', eulogyIds),
      user
        ? supabase.from('likes').select('eulogy_id').eq('user_id', user.id).in('eulogy_id', eulogyIds)
        : Promise.resolve({ data: null }),
      supabase.from('comments').select('eulogy_id').in('eulogy_id', eulogyIds),
    ]);

    if (isMounted && !isMounted.current) return;

    const likesData = likesResult.data;
    const userLikes = userLikesResult.data?.map(l => l.eulogy_id) || [];
    const commentsData = commentsResult.data;

    // Count likes and comments per eulogy
    const likeCounts: Record<string, number> = {};
    const commentCounts: Record<string, number> = {};

    likesData?.forEach(l => {
      likeCounts[l.eulogy_id] = (likeCounts[l.eulogy_id] || 0) + 1;
    });

    commentsData?.forEach(c => {
      commentCounts[c.eulogy_id] = (commentCounts[c.eulogy_id] || 0) + 1;
    });

    // Combine data
    const enrichedEulogies = eulogiesData.map(e => ({
      ...e,
      likes_count: likeCounts[e.id] || 0,
      comments_count: commentCounts[e.id] || 0,
      user_has_liked: userLikes.includes(e.id),
    })) as unknown as Eulogy[];

    setEulogies(enrichedEulogies);
    setLoading(false);
  }, [user]);

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

  const handleLike = async (eulogy: Eulogy) => {
    if (!user) {
      showToast('Sign in to like posts', 'info');
      return;
    }

    // Prevent double-tap race condition
    if (pendingLikes.has(eulogy.id)) {
      return;
    }

    const hasLiked = eulogy.user_has_liked;

    // Mark as pending
    setPendingLikes(prev => new Set(prev).add(eulogy.id));

    // Haptic feedback on native
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Optimistic update
    setEulogies(prev => prev.map(e =>
      e.id === eulogy.id
        ? {
            ...e,
            user_has_liked: !hasLiked,
            likes_count: hasLiked ? e.likes_count - 1 : e.likes_count + 1
          }
        : e
    ));

    try {
      if (hasLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('eulogy_id', eulogy.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, eulogy_id: eulogy.id });

        if (error) throw error;
      }
    } catch {
      // Revert on error
      setEulogies(prev => prev.map(e =>
        e.id === eulogy.id
          ? {
              ...e,
              user_has_liked: hasLiked,
              likes_count: hasLiked ? e.likes_count + 1 : e.likes_count - 1
            }
          : e
      ));
      showToast('Failed to update. Please try again.', 'error');
    } finally {
      // Clear pending state
      setPendingLikes(prev => {
        const next = new Set(prev);
        next.delete(eulogy.id);
        return next;
      });
    }
  };

  const handleShare = async (eulogy: Eulogy) => {
    const baseUrl = getBaseUrl();
    const link = `${baseUrl}/view/${eulogy.share_token}`;
    const authorName = eulogy.is_anonymous ? 'Someone' : (eulogy.profiles?.display_name || 'Someone');

    if (Platform.OS === 'web') {
      // Web: copy to clipboard
      try {
        await navigator.clipboard.writeText(link);
        showToast('Link copied to clipboard');
      } catch {
        showToast('Could not copy link', 'error');
      }
    } else {
      // Native: use share sheet
      try {
        await Share.share({
          message: `${authorName} wrote something beautiful for ${eulogy.recipient_name}. Read it here: ${link}`,
          url: link,
          title: 'Living Eulogy',
        });
      } catch (error) {
        // User cancelled or error
      }
    }
  };

  const handleComment = (eulogy: Eulogy) => {
    // TODO: Open comments modal/screen
    showToast('Comments coming soon', 'info');
  };

  const renderEulogy = ({ item }: { item: Eulogy }) => {
    const authorName = item.is_anonymous ? 'Anonymous' : (item.profiles?.display_name || 'Anonymous');

    return (
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Avatar name={item.is_anonymous ? '?' : authorName} size="md" />
          <View style={styles.headerText}>
            <Text style={styles.authorName}>{authorName}</Text>
            <Text style={styles.meta}>
              wrote to <Text style={styles.recipientName}>{item.recipient_name}</Text> · {formatDate(item.created_at, 'relative')}
            </Text>
          </View>
        </View>

        {/* Content */}
        <Text style={styles.content} numberOfLines={5}>
          {item.content}
        </Text>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.6}
            onPress={() => handleLike(item)}
            accessibilityRole="button"
            accessibilityLabel={item.user_has_liked ? 'Unlike' : 'Like'}
            accessibilityState={{ selected: item.user_has_liked }}
          >
            <Heart
              size={20}
              color={item.user_has_liked ? '#EF4444' : brand.textMuted}
              fill={item.user_has_liked ? '#EF4444' : 'transparent'}
              strokeWidth={1.5}
            />
            {item.likes_count > 0 && (
              <Text style={[styles.actionCount, item.user_has_liked && styles.actionCountLiked]}>
                {item.likes_count}
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.6}
            onPress={() => handleComment(item)}
            accessibilityRole="button"
            accessibilityLabel="Comment"
          >
            <MessageCircle size={20} color={brand.textMuted} strokeWidth={1.5} />
            {item.comments_count > 0 && (
              <Text style={styles.actionCount}>{item.comments_count}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            activeOpacity={0.6}
            onPress={() => handleShare(item)}
            accessibilityRole="button"
            accessibilityLabel="Share"
          >
            <Share2 size={20} color={brand.textMuted} strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleWritePress = useCallback(() => {
    router.push('/(tabs)/write');
  }, []);

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
        ListEmptyComponent={!loading ? <EmptyFeed onWritePress={handleWritePress} /> : null}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>Discover</Text>
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
  meta: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.textMuted,
    marginTop: 2,
  },
  recipientName: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.primary,
  },
  content: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: brand.text,
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    gap: 6,
  },
  actionCount: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: brand.textMuted,
  },
  actionCountLiked: {
    color: '#EF4444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  writeButton: {
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.full,
    marginTop: spacing.md,
  },
  writeButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    fontSize: 15,
  },
});
