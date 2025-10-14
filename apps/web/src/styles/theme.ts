/**
 * Diego Portfolio Design System Theme Configuration
 * 
 * This file defines the complete design system including colors, typography,
 * spacing, and other design tokens for the Diego Portfolio application.
 * 
 * Based on: docs/diego-portfolio-ux-spec.md#branding--style-guide
 */

export const theme = {
  // Color Palette - Based on UX Specification
  colors: {
    // Primary Colors
    primary: {
      50: '#f0f4ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1', // Secondary from spec
      600: '#4f46e5', // Secondary from spec
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      DEFAULT: '#000D7C', // Primary from spec - Deep Royal Blue
    },
    
    // Secondary Colors (Indigo)
    secondary: {
      50: '#f0f4ff',
      100: '#e0e7ff',
      200: '#c7d2fe',
      300: '#a5b4fc',
      400: '#818cf8',
      500: '#6366f1',
      600: '#4f46e5',
      700: '#4338ca',
      800: '#3730a3',
      900: '#312e81',
      DEFAULT: '#4F46E5', // Indigo blue, modern
    },
    
    // Accent Colors (Amber)
    accent: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      DEFAULT: '#F59E0B', // Amber, warm contrast
    },
    
    // Semantic Colors
    success: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      DEFAULT: '#10B981', // Emerald green
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
      DEFAULT: '#F59E0B', // Amber (same as accent)
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      DEFAULT: '#EF4444', // Red, clear alert
    },
    
    // Background Colors
    background: {
      dark: '#0F172A', // Slate 900, rich dark
      light: '#1E293B', // Slate 800
      DEFAULT: '#0F172A',
    },
    
    // Text Colors
    text: {
      primary: '#F8FAFC', // Slate 50, high contrast
      secondary: '#CBD5E1', // Slate 300, readable
      DEFAULT: '#F8FAFC',
    },
    
    // Border Colors
    border: {
      DEFAULT: '#334155', // Slate 700, subtle
      light: '#475569', // Slate 600
      dark: '#1e293b', // Slate 800
    },
  },

  // Typography Configuration
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      mono: ['Fira Code', 'Courier New', 'monospace'],
    },
    
    fontSize: {
      // Heading sizes
      'h1': ['48px', { lineHeight: '1.2', fontWeight: '700' }], // 3rem
      'h2': ['36px', { lineHeight: '1.3', fontWeight: '600' }], // 2.25rem
      'h3': ['24px', { lineHeight: '1.4', fontWeight: '600' }], // 1.5rem
      'h4': ['20px', { lineHeight: '1.5', fontWeight: '600' }], // 1.25rem
      
      // Body text sizes
      'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }], // 1.125rem
      'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }], // 1rem
      'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }], // 0.875rem
      'tiny': ['12px', { lineHeight: '1.4', fontWeight: '500' }], // 0.75rem
    },
    
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    
    lineHeight: {
      tight: '1.2',
      snug: '1.3',
      normal: '1.4',
      relaxed: '1.5',
      loose: '1.6',
    },
  },

  // Spacing Scale (4px base unit)
  spacing: {
    xs: '4px',    // 0.25rem
    sm: '8px',    // 0.5rem
    md: '12px',   // 0.75rem
    base: '16px', // 1rem
    lg: '24px',   // 1.5rem
    xl: '32px',   // 2rem
    '2xl': '48px', // 3rem
    '3xl': '64px', // 4rem
    '4xl': '96px', // 6rem
  },

  // Breakpoints for responsive design
  breakpoints: {
    mobile: '320px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1280px',
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  // Animation durations
  animation: {
    duration: {
      fast: '100ms',
      normal: '200ms',
      slow: '300ms',
      slower: '400ms',
    },
    easing: {
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const;

// Type definitions for theme
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeTypography = typeof theme.typography;
export type ThemeSpacing = typeof theme.spacing;

// Utility functions for theme access
export const getColor = (colorPath: string): string => {
  const keys = colorPath.split('.');
  let value: any = theme.colors;
  
  for (const key of keys) {
    value = value[key];
    if (value === undefined) {
      console.warn(`Color path "${colorPath}" not found in theme`);
      return '#000000';
    }
  }
  
  return value;
};

export const getSpacing = (size: keyof ThemeSpacing): string => {
  return theme.spacing[size];
};

export const getTypography = (variant: keyof typeof theme.typography.fontSize) => {
  return theme.typography.fontSize[variant];
};

// CSS Custom Properties generator
export const generateCSSVariables = (): Record<string, string> => {
  const variables: Record<string, string> = {};
  
  // Color variables
  Object.entries(theme.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object' && colors !== null) {
      Object.entries(colors).forEach(([shade, value]) => {
        if (typeof value === 'string') {
          variables[`--color-${category}-${shade}`] = value;
        }
      });
    }
  });
  
  // Spacing variables
  Object.entries(theme.spacing).forEach(([size, value]) => {
    variables[`--spacing-${size}`] = value;
  });
  
  // Typography variables
  Object.entries(theme.typography.fontSize).forEach(([variant, config]) => {
    if (Array.isArray(config)) {
      variables[`--font-size-${variant}`] = config[0];
      variables[`--line-height-${variant}`] = config[1].lineHeight;
      variables[`--font-weight-${variant}`] = config[1].fontWeight;
    }
  });
  
  return variables;
};

export default theme;
