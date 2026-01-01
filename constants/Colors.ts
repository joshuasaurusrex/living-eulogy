// Living Eulogy Brand Colors - Light & Joyful

export const brand = {
  // Primary - Indigo (modern, trustworthy)
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',

  // Accent - Amber/Gold (warmth, joy, celebration)
  accent: '#F59E0B',
  accentLight: '#FBBF24',
  accentDark: '#D97706',

  // Backgrounds
  background: '#FFFFFF',
  backgroundAlt: '#F8FAFC',       // slate-50
  backgroundAccent: '#F0F9FF',    // sky-50 tint

  // Text
  text: '#1E293B',               // slate-800
  textSecondary: '#64748B',      // slate-500
  textMuted: '#94A3B8',          // slate-400

  // Borders
  border: '#E2E8F0',             // slate-200
  borderLight: '#F1F5F9',        // slate-100

  // Status
  success: '#10B981',            // emerald-500
  error: '#EF4444',              // red-500
  warning: '#F59E0B',            // amber-500
};

export default {
  light: {
    text: brand.text,
    textSecondary: brand.textSecondary,
    background: brand.background,
    backgroundAlt: brand.backgroundAlt,
    tint: brand.primary,
    tabIconDefault: brand.textMuted,
    tabIconSelected: brand.primary,
    border: brand.border,
    card: brand.background,
  },
  dark: {
    text: '#F8FAFC',
    textSecondary: '#CBD5E1',
    background: '#0F172A',
    backgroundAlt: '#1E293B',
    tint: brand.primaryLight,
    tabIconDefault: '#64748B',
    tabIconSelected: brand.primaryLight,
    border: '#334155',
    card: '#1E293B',
  },
};
