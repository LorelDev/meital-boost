export const colors = {
  primary: '#6C63FF',
  primaryLight: '#8B85FF',
  primaryDark: '#5048E5',
  secondary: '#FF6584',
  accent: '#43E97B',
  gold: '#FFD700',
  goldLight: '#FFE55C',

  background: '#F8F7FF',
  surface: '#FFFFFF',
  surfaceAlt: '#F0EEFF',
  border: '#E8E4FF',

  text: '#1A1035',
  textSecondary: '#6B6589',
  textMuted: '#A89EC9',
  textInverse: '#FFFFFF',

  success: '#43E97B',
  warning: '#FFA040',
  error: '#FF4757',
  info: '#4ECDC4',

  shadow: 'rgba(108, 99, 255, 0.15)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  full: 9999,
};

export const typography = {
  h1: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' as const },
  h4: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  bodySmall: { fontSize: 13, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '500' as const },
  label: { fontSize: 13, fontWeight: '600' as const, letterSpacing: 0.5 },
};

export const shadows = {
  sm: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
};
