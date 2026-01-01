import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
  Linking,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { brand } from '@/constants/Colors';
import { spacing, radius, shadows } from '@/constants/Theme';

type MenuItemProps = {
  icon: string;
  label: string;
  onPress?: () => void;
};

const MenuItem = ({ icon, label, onPress }: MenuItemProps) => (
  <TouchableOpacity
    style={styles.menuItem}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={label}
  >
    <View style={styles.menuItemContent}>
      <Text style={styles.menuIcon}>{icon}</Text>
      <Text style={styles.menuText}>{label}</Text>
    </View>
    <Text style={styles.menuArrow}>›</Text>
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [stats, setStats] = useState({ written: 0, received: 0, likes: 0 });

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const doFetch = async () => {
        if (!user) return;

        try {
          const { count: writtenCount, error: writtenError } = await supabase
            .from('eulogies')
            .select('*', { count: 'exact', head: true })
            .eq('author_id', user.id);

          if (writtenError) throw writtenError;

          const { count: receivedCount, error: receivedError } = await supabase
            .from('eulogies')
            .select('*', { count: 'exact', head: true })
            .eq('recipient_email', user.email);

          if (receivedError) throw receivedError;

          const { data: userEulogies, error: eulogiesError } = await supabase
            .from('eulogies')
            .select('id')
            .eq('author_id', user.id);

          if (eulogiesError) throw eulogiesError;

          let likesCount = 0;
          if (userEulogies && userEulogies.length > 0) {
            const eulogyIds = userEulogies.map(e => e.id);
            const { count, error: likesError } = await supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .in('eulogy_id', eulogyIds);

            if (likesError) throw likesError;
            likesCount = count || 0;
          }

          if (isMounted) {
            setStats({
              written: writtenCount || 0,
              received: receivedCount || 0,
              likes: likesCount,
            });
          }
        } catch (err) {
          console.error('Failed to fetch profile stats:', err);
        }
      };

      doFetch();

      return () => {
        isMounted = false;
      };
    }, [user])
  );

  const handleSignOut = async () => {
    const doSignOut = async () => {
      await signOut();
      router.replace('/(auth)/welcome');
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        doSignOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: doSignOut },
      ]);
    }
  };

  const getInitial = () => {
    return (
      user?.user_metadata?.display_name?.[0]?.toUpperCase() ||
      user?.email?.[0]?.toUpperCase() ||
      '?'
    );
  };

  const handleContact = () => {
    Linking.openURL('mailto:hello@livingeulogy.io');
  };

  const handleTerms = () => {
    Linking.openURL('https://livingeulogy.io/terms');
  };

  const handlePrivacy = () => {
    Linking.openURL('https://livingeulogy.io/privacy');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitial()}</Text>
          </View>
          <Text style={styles.name}>
            {user?.user_metadata?.display_name || 'User'}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Stats - only show if user has any activity */}
        {(stats.written > 0 || stats.received > 0 || stats.likes > 0) && (
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.written}</Text>
              <Text style={styles.statLabel}>Written</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.received}</Text>
              <Text style={styles.statLabel}>Received</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.likes}</Text>
              <Text style={styles.statLabel}>Likes</Text>
            </View>
          </View>
        )}

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="💬" label="Contact Us" onPress={handleContact} />
            <MenuItem icon="🔒" label="Privacy Policy" onPress={handlePrivacy} />
            <MenuItem icon="📜" label="Terms of Service" onPress={handleTerms} />
          </View>
        </View>

        {/* About */}
        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>Living Eulogy</Text>
          <Text style={styles.aboutSubtitle}>
            Share what matters, while it matters.
          </Text>
          <Text style={styles.version}>Version 1.0.0</Text>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
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
    paddingBottom: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: brand.background,
    borderBottomWidth: 1,
    borderBottomColor: brand.border,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 36,
    color: '#fff',
  },
  name: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 24,
    color: brand.text,
    marginBottom: spacing.xs,
  },
  email: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textSecondary,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: brand.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: brand.border,
  },
  statNumber: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: brand.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: brand.textMuted,
  },
  section: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: brand.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  menuCard: {
    backgroundColor: brand.background,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: brand.borderLight,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
    color: brand.text,
  },
  menuArrow: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
    color: brand.textMuted,
  },
  aboutSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  aboutTitle: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 18,
    color: brand.primary,
    marginBottom: spacing.xs,
  },
  aboutSubtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: brand.textSecondary,
    marginBottom: spacing.sm,
  },
  version: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: brand.textMuted,
  },
  signOutButton: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: brand.background,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: brand.textSecondary,
  },
});
