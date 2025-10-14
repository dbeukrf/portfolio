/**
 * Theme Utility Functions
 * 
 * Utility functions for working with the design system theme.
 * Provides helper functions for colors, spacing, typography, and accessibility.
 */

import { theme } from '../styles/theme';

/**
 * Get color value from theme by path
 * 
 * @param colorPath - Dot notation path to color (e.g., 'primary.500', 'text.primary')
 * @returns Color value as string
 */
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

/**
 * Get spacing value from theme
 * 
 * @param size - Spacing size key
 * @returns Spacing value as string
 */
export const getSpacing = (size: keyof typeof theme.spacing): string => {
  return theme.spacing[size];
};

/**
 * Get typography configuration
 * 
 * @param variant - Typography variant
 * @returns Typography configuration object
 */
export const getTypography = (variant: keyof typeof theme.typography.fontSize) => {
  return theme.typography.fontSize[variant];
};

/**
 * Calculate color contrast ratio between two colors
 * 
 * @param color1 - First color (hex)
 * @param color2 - Second color (hex)
 * @returns Contrast ratio as number
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const getLuminance = (color: string): number => {
    const rgb = hexToRgb(color);
    if (!rgb) return 0;
    
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
};

/**
 * Convert hex color to RGB
 * 
 * @param hex - Hex color string
 * @returns RGB object or null if invalid
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

/**
 * Check if color combination meets WCAG AA standards
 * 
 * @param foreground - Foreground color (hex)
 * @param background - Background color (hex)
 * @param isLargeText - Whether text is large (18px+ or 14px+ bold)
 * @returns Object with contrast ratio and compliance status
 */
export const checkWCAGCompliance = (
  foreground: string, 
  background: string, 
  isLargeText: boolean = false
) => {
  const ratio = getContrastRatio(foreground, background);
  const requiredRatio = isLargeText ? 3 : 4.5;
  const isCompliant = ratio >= requiredRatio;
  
  return {
    ratio: Math.round(ratio * 100) / 100,
    required: requiredRatio,
    isCompliant,
    level: isCompliant ? 'AA' : 'Fail',
  };
};

/**
 * Generate responsive breakpoint classes
 * 
 * @param base - Base class name
 * @param variants - Object with breakpoint variants
 * @returns Responsive class string
 */
export const getResponsiveClasses = (
  base: string, 
  variants: Record<string, string> = {}
): string => {
  const classes = [base];
  
  Object.entries(variants).forEach(([breakpoint, variant]) => {
    classes.push(`${breakpoint}:${variant}`);
  });
  
  return classes.join(' ');
};

/**
 * Generate spacing classes for margin/padding
 * 
 * @param direction - Direction (m, p, mt, mb, ml, mr, pt, pb, pl, pr)
 * @param size - Spacing size
 * @returns Tailwind class string
 */
export const getSpacingClass = (
  direction: 'm' | 'p' | 'mt' | 'mb' | 'ml' | 'mr' | 'pt' | 'pb' | 'pl' | 'pr',
  size: keyof typeof theme.spacing
): string => {
  return `${direction}-${size}`;
};

/**
 * Generate color classes for text/background
 * 
 * @param type - Type (text, bg, border)
 * @param color - Color path
 * @returns Tailwind class string
 */
export const getColorClass = (type: 'text' | 'bg' | 'border', color: string): string => {
  return `${type}-${color.replace('.', '-')}`;
};

/**
 * Get theme-aware CSS custom property
 * 
 * @param property - CSS property name
 * @returns CSS custom property string
 */
export const getCSSVariable = (property: string): string => {
  return `var(--${property})`;
};

/**
 * Generate CSS custom properties for theme
 * 
 * @returns Object with CSS custom properties
 */
export const generateThemeVariables = (): Record<string, string> => {
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

/**
 * Validate theme configuration
 * 
 * @returns Object with validation results
 */
export const validateTheme = () => {
  const issues: string[] = [];
  const warnings: string[] = [];
  
  // Check color contrast for common combinations
  const textPrimary = getColor('text.primary');
  const backgroundDark = getColor('background.dark');
  const primaryColor = getColor('primary.DEFAULT');
  
  const textContrast = checkWCAGCompliance(textPrimary, backgroundDark);
  if (!textContrast.isCompliant) {
    issues.push(`Text primary on background dark: ${textContrast.ratio}:1 (required: ${textContrast.required}:1)`);
  }
  
  const primaryContrast = checkWCAGCompliance(primaryColor, backgroundDark);
  if (!primaryContrast.isCompliant) {
    issues.push(`Primary color on background dark: ${primaryContrast.ratio}:1 (required: ${primaryContrast.required}:1)`);
  }
  
  // Check if all required colors are defined
  const requiredColors = [
    'primary.DEFAULT',
    'secondary.DEFAULT',
    'accent.DEFAULT',
    'success.DEFAULT',
    'warning.DEFAULT',
    'error.DEFAULT',
    'text.primary',
    'text.secondary',
    'background.dark',
    'background.light',
    'border.DEFAULT',
  ];
  
  requiredColors.forEach(colorPath => {
    const color = getColor(colorPath);
    if (color === '#000000') {
      issues.push(`Missing required color: ${colorPath}`);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
};

export default {
  getColor,
  getSpacing,
  getTypography,
  getContrastRatio,
  hexToRgb,
  checkWCAGCompliance,
  getResponsiveClasses,
  getSpacingClass,
  getColorClass,
  getCSSVariable,
  generateThemeVariables,
  validateTheme,
};
