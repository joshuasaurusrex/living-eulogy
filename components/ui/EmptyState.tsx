import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Heart, Inbox, BookHeart, Feather } from 'lucide-react-native';
import { brand } from '@/constants/Colors';
import { spacing, radius } from '@/constants/Theme';

type EmptyStateType = 'feed' | 'inbox' | 'library' | 'write';

interface EmptyStateProps {
  type: EmptyStateType;
  title: string;
  description: string;
}

const ICONS = {
  feed: Heart,
  inbox: Inbox,
  library: BookHeart,
  write: Feather,
};

export function EmptyState({ type, title, description }: EmptyStateProps) {
  const Icon = ICONS[type];

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Icon size={48} color={brand.primary} strokeWidth={1.5} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#EEF2FF', // indigo-50
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 18,
    color: brand.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    color: brand.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
