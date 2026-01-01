import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
} from 'react-native';
import { useAuth } from '@/lib/auth-context';
import { brand } from '@/constants/Colors';
import { spacing, radius, shadows } from '@/constants/Theme';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to sign out?')) {
        signOut();
      }
    } else {
      Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
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

  const MenuItem = ({
    icon,
    label,
    onPress,
    comingSoon = false,
  }: {
    icon: string;
    label: string;
    onPress?: () => void;
    comingSoon?: boolean;
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, comingSoon && styles.menuItemDisabled]}
      onPress={comingSoon ? undefined : onPress}
      activeOpacity={comingSoon ? 1 : 0.7}
    >
      <View style={styles.menuItemContent}>
        <Text style={styles.menuIcon}>{icon}</Text>
        <Text style={[styles.menuText, comingSoon && styles.menuTextDisabled]}>
          {label}
        </Text>
      </View>
      {comingSoon ? (
        <Text style={styles.comingSoonBadge}>Soon</Text>
      ) : (
        <Text style={styles.menuArrow}>›</Text>
      )}
    </TouchableOpacity>
  );

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

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Written</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Received</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>—</Text>
            <Text style={styles.statLabel}>Shared</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="✏️" label="Edit Profile" comingSoon />
            <MenuItem icon="🔔" label="Notifications" comingSoon />
            <MenuItem icon="🔒" label="Privacy" comingSoon />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="❓" label="Help & FAQ" comingSoon />
            <MenuItem icon="💬" label="Contact Us" comingSoon />
            <MenuItem icon="📜" label="Terms of Service" comingSoon />
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
  menuItemDisabled: {
    opacity: 0.6,
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
  menuTextDisabled: {
    color: brand.textSecondary,
  },
  menuArrow: {
    fontFamily: 'Inter_400Regular',
    fontSize: 20,
    color: brand.textMuted,
  },
  comingSoonBadge: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: brand.textMuted,
    backgroundColor: brand.backgroundAlt,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
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
    borderWidth: 2,
    borderColor: brand.error,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: brand.error,
  },
});
