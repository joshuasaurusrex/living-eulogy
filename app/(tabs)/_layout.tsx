import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Tabs, router, usePathname } from 'expo-router';
import { Home, Inbox, BookHeart, User, Plus } from 'lucide-react-native';

import { brand } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';


function TabBarIcon({
  Icon,
  color,
  size = 24
}: {
  Icon: typeof Home;
  color: string;
  size?: number;
}) {
  return <Icon size={size} color={color} strokeWidth={2} />;
}

function FloatingActionButton() {
  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={() => router.push('/(tabs)/write')}
      activeOpacity={0.8}
    >
      <Plus size={28} color="#fff" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const pathname = usePathname();
  const isDark = colorScheme === 'dark';
  const isWriteScreen = pathname === '/write' || pathname === '/(tabs)/write';

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: brand.primary,
          tabBarInactiveTintColor: brand.textMuted,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: isDark ? '#1a1a1a' : brand.background,
            borderTopColor: isDark ? '#333' : brand.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 85 : 56,
            paddingTop: 8,
            paddingBottom: Platform.OS === 'ios' ? 28 : 4,
          },
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon Icon={Home} color={color} />,
          }}
        />
        <Tabs.Screen
          name="for-me"
          options={{
            title: 'Inbox',
            tabBarIcon: ({ color }) => <TabBarIcon Icon={Inbox} color={color} />,
          }}
        />
        {/* Spacer for FAB */}
        <Tabs.Screen
          name="write"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="my-eulogies"
          options={{
            title: 'Library',
            tabBarIcon: ({ color }) => <TabBarIcon Icon={BookHeart} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <TabBarIcon Icon={User} color={color} />,
          }}
        />
        {/* Hide the old two.tsx from tabs */}
        <Tabs.Screen name="two" options={{ href: null }} />
      </Tabs>
      {!isWriteScreen && <FloatingActionButton />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 28,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 100,
  },
});
