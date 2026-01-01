import { StyleSheet } from 'react-native';
import { brand } from './Colors';

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Border radius
export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 5,
  },
};

// Common component styles
export const commonStyles = StyleSheet.create({
  // Containers
  screenContainer: {
    flex: 1,
    backgroundColor: brand.backgroundAlt,
  },
  contentContainer: {
    padding: spacing.lg,
  },

  // Cards
  card: {
    backgroundColor: brand.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.md,
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
  },

  // Buttons
  buttonPrimary: {
    backgroundColor: brand.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: brand.primary,
    paddingVertical: spacing.md - 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  buttonSecondaryText: {
    color: brand.primary,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Inputs
  input: {
    backgroundColor: brand.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: brand.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: brand.text,
  },
  inputFocused: {
    borderColor: brand.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: brand.error,
  },

  // Text styles
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: brand.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: brand.textSecondary,
    lineHeight: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: brand.text,
    marginBottom: spacing.xs,
  },
  bodyText: {
    fontSize: 16,
    color: brand.text,
    lineHeight: 24,
  },
  caption: {
    fontSize: 12,
    color: brand.textMuted,
  },

  // Layout helpers
  row: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  spaceBetween: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  center: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
});

export default { spacing, radius, shadows, commonStyles, brand };
