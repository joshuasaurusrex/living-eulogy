import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { brand } from '@/constants/Colors';

type AvatarSize = 'sm' | 'md' | 'lg';

interface AvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: AvatarSize;
}

const SIZES: Record<AvatarSize, { container: number; text: number }> = {
  sm: { container: 32, text: 12 },
  md: { container: 40, text: 14 },
  lg: { container: 56, text: 20 },
};

// Generate a consistent color based on the name
function getAvatarColor(name: string): string {
  const colors = [
    '#6366F1', // indigo
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#F59E0B', // amber
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#EF4444', // red
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const dimensions = SIZES[size];
  const backgroundColor = getAvatarColor(name);

  const containerStyle = {
    width: dimensions.container,
    height: dimensions.container,
    borderRadius: dimensions.container / 2,
  };

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, containerStyle]}
      />
    );
  }

  return (
    <View style={[styles.container, containerStyle, { backgroundColor }]}>
      <Text style={[styles.initials, { fontSize: dimensions.text }]}>
        {getInitials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    backgroundColor: brand.backgroundAlt,
  },
  initials: {
    fontFamily: 'Inter_600SemiBold',
    color: '#fff',
  },
});
