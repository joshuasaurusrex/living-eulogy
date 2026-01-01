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
  Platform,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import { Lock, Users, Globe, Link2, Trash2 } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { brand } from '@/constants/Colors';
import { spacing, radius } from '@/constants/Theme';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { useToast } from '@/components/ui/Toast';
import { getBaseUrl, formatDate } from '@/lib/utils';

const Separator = () => <View style={styles.separator} />;

const VisibilityIcon = ({ visibility }: { visibility: string }) => {
  const props = { size: 14, strokeWidth: 2 };
  switch (visibility) {
    case 'private':
      return <Lock {...props} color={brand.textMuted} />;
    case 'friends':
      return <Users {...props} color={brand.textMuted} />;
    case 'public':
      return <Globe {...props} color={brand.textMuted} />;
    default:
      return <Lock {...props} color={brand.textMuted} />;
  }
};

const EmptyLibrary = ({ onWritePress }: { onWritePress: () => void }) => (
  <View style={styles.emptyContainer}>
    <EmptyState
      type="library"
      title="No eulogies yet"
      description="Start writing to share your appreciation with someone special"
    />
    <TouchableOpacity
      style={styles.writeButton}
      onPress={onWritePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel="Write your first eulogy"
    >
      <Text style={styles.writeButtonText}>Write Your First</Text>
    </TouchableOpacity>
  </View>
);

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
  const { showToast } = useToast();
  const [eulogies, setEulogies] = useState<Eulogy[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEulogies = useCallback(async (isMounted?: { current: boolean }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('eulogies')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (isMounted && !isMounted.current) return;

      if (error) {
        console.error('Failed to fetch eulogies:', error);
        setEulogies([]);
      } else {
        setEulogies(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch eulogies:', err);
      if (!isMounted || isMounted.current) setEulogies([]);
    } finally {
      if (!isMounted || isMounted.current) setLoading(false);
    }
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

  const handleShare = async (eulogy: Eulogy) => {
    const baseUrl = getBaseUrl();
    const link = `${baseUrl}/view/${eulogy.share_token}`;

    try {
      await Clipboard.setStringAsync(link);
      showToast('Link copied to clipboard');
    } catch {
      showToast('Failed to copy link', 'error');
    }
  };

  const handleDelete = (eulogy: Eulogy) => {
    // Prevent double-tap while deleting
    if (deletingId) return;

    const doDelete = async () => {
      setDeletingId(eulogy.id);
      const { error } = await supabase
        .from('eulogies')
        .delete()
        .eq('id', eulogy.id);

      if (error) {
        showToast('Failed to delete. Please try again.', 'error');
      } else {
        setEulogies(prev => prev.filter((e) => e.id !== eulogy.id));
        showToast('Eulogy deleted');
      }
      setDeletingId(null);
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Delete your eulogy for ${eulogy.recipient_name}? This cannot be undone.`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'Delete Eulogy',
        `Are you sure you want to delete your eulogy for ${eulogy.recipient_name}? This cannot be undone.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: doDelete },
        ]
      );
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

  const renderEulogy = ({ item }: { item: Eulogy }) => (
    <View style={styles.card}>
      {/* Card Header */}
      <View style={styles.cardHeader}>
        <Avatar name={item.recipient_name} size="md" />
        <View style={styles.headerText}>
          <Text style={styles.recipientName}>For {item.recipient_name}</Text>
          <View style={styles.metaRow}>
            <VisibilityIcon visibility={item.visibility} />
            <Text style={styles.metaText}>{getVisibilityLabel(item.visibility)}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content} numberOfLines={3}>
        {item.content}
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleShare(item)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`Copy share link for eulogy to ${item.recipient_name}`}
        >
          <Link2 size={18} color={brand.primary} strokeWidth={2} />
          <Text style={styles.actionText}>Copy Link</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteAction, deletingId === item.id && styles.actionDisabled]}
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
          disabled={deletingId === item.id}
          accessibilityRole="button"
          accessibilityLabel={`Delete eulogy for ${item.recipient_name}`}
          accessibilityState={{ disabled: deletingId === item.id }}
        >
          {deletingId === item.id ? (
            <ActivityIndicator size="small" color={brand.error} />
          ) : (
            <Trash2 size={18} color={brand.error} strokeWidth={2} />
          )}
          <Text style={styles.deleteText}>{deletingId === item.id ? 'Deleting...' : 'Delete'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        ListEmptyComponent={!loading ? <EmptyLibrary onWritePress={handleWritePress} /> : null}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.header}>My Eulogies</Text>
            {eulogies.length > 0 && (
              <Text style={styles.headerSubtitle}>
                {eulogies.length} {eulogies.length === 1 ? 'eulogy' : 'eulogies'}
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
  recipientName: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    color: brand.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.textMuted,
  },
  metaDot: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: brand.textMuted,
    marginHorizontal: 2,
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
    gap: spacing.md,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  actionText: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.primary,
    fontSize: 14,
  },
  deleteAction: {
    backgroundColor: '#FEF2F2',
  },
  deleteText: {
    fontFamily: 'Inter_600SemiBold',
    color: brand.error,
    fontSize: 14,
  },
  actionDisabled: {
    opacity: 0.6,
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
