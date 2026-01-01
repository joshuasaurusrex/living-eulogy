import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { brand } from '@/constants/Colors';
import { spacing, radius, shadows } from '@/constants/Theme';

type Eulogy = {
  id: string;
  recipient_name: string;
  content: string;
  visibility: string;
  share_token: string;
  created_at: string;
};

export default function MyEulogiesScreen() {
  const { user } = useAuth();
  const [eulogies, setEulogies] = useState<Eulogy[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return 'https://livingeulogy.io';
  };

  const fetchMyEulogies = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('eulogies')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setEulogies(data);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchMyEulogies();
    }, [user])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyEulogies();
    setRefreshing(false);
  };

  const handleShare = async (eulogy: Eulogy) => {
    const baseUrl = getBaseUrl();
    const link = `${baseUrl}/view/${eulogy.share_token}`;

    await Clipboard.setStringAsync(link);

    Alert.alert(
      'Link Copied!',
      `Share this link with ${eulogy.recipient_name}:\n\n${link}`,
      [{ text: 'Done' }]
    );
  };

  const handleDelete = (eulogy: Eulogy) => {
    Alert.alert(
      'Delete Eulogy',
      `Are you sure you want to delete your eulogy for ${eulogy.recipient_name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('eulogies')
              .delete()
              .eq('id', eulogy.id);
            if (!error) {
              setEulogies(eulogies.filter((e) => e.id !== eulogy.id));
            }
          },
        },
      ]
    );
  };

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return '🔒';
      case 'friends':
        return '👥';
      case 'public':
        return '🌍';
      default:
        return '🔒';
    }
  };

  const getVisibilityLabel = (visibility: string) => {
    switch (visibility) {
      case 'private':
        return 'Private';
      case 'friends':
        return 'Friends';
      case 'public':
        return 'Public';
      default:
        return visibility;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderEulogy = ({ item }: { item: Eulogy }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.recipient}>For {item.recipient_name}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeIcon}>{getVisibilityIcon(item.visibility)}</Text>
          <Text style={styles.badgeText}>{getVisibilityLabel(item.visibility)}</Text>
        </View>
      </View>
      <Text style={styles.content} numberOfLines={3}>
        {item.content}
      </Text>
      <Text style={styles.date}>{formatDate(item.created_at)}</Text>
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>Copy Link</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>✍️</Text>
      <Text style={styles.emptyTitle}>No eulogies yet</Text>
      <Text style={styles.emptySubtitle}>
        Start writing to share your appreciation{'\n'}with someone special
      </Text>
      <TouchableOpacity
        style={styles.writeButton}
        onPress={() => router.push('/(tabs)/write')}
        activeOpacity={0.8}
      >
        <Text style={styles.writeButtonText}>Write Your First Eulogy</Text>
      </TouchableOpacity>
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
          eulogies.length > 0 ? (
            <View style={styles.headerContainer}>
              <Text style={styles.header}>My Eulogies</Text>
              <Text style={styles.headerSubtitle}>
                {eulogies.length} {eulogies.length === 1 ? 'eulogy' : 'eulogies'} written
              </Text>
            </View>
          ) : null
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
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  recipient: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 18,
    color: brand.primary,
    flex: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.backgroundAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: 4,
  },
  badgeIcon: {
    fontSize: 12,
  },
  badgeText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: brand.textSecondary,
  },
  content: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.text,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  date: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: brand.textMuted,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: brand.borderLight,
    paddingTop: spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.backgroundAlt,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  actionIcon: {
    fontSize: 14,
  },
  actionText: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.accent,
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.error,
    fontSize: 14,
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
  writeButton: {
    backgroundColor: brand.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  writeButtonText: {
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
    fontSize: 16,
  },
});
