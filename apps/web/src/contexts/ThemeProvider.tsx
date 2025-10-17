/**
 * Theme Provider Context
 * 
 * Provides theme access throughout the application using React Context.
 * Supports theme switching and provides theme utilities to components.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { theme, generateCSSVariables } from '../styles/theme';
import type { Theme } from '../styles/theme';

// Theme context type
interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  getColor: (colorPath: string) => string;
  getSpacing: (size: keyof typeof theme.spacing) => string;
}

// Create theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: 'light' | 'dark';
}

/**
 * Theme Provider Component
 * 
 * Wraps the application to provide theme context and utilities.
 * Manages theme state and applies CSS custom properties.
 */
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  defaultTheme = 'dark' 
}) => {
  const [isDark, setIsDark] = useState<boolean>(defaultTheme === 'dark');

  // Apply CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const cssVariables = generateCSSVariables();
    
    // Apply CSS variables to root element
    Object.entries(cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Apply theme-specific variables
    if (isDark) {
      root.style.setProperty('--theme-background', theme.colors.background.dark);
      root.style.setProperty('--theme-text-primary', theme.colors.text.primary);
      root.style.setProperty('--theme-text-secondary', theme.colors.text.secondary);
    } else {
      // Light theme (future implementation)
      root.style.setProperty('--theme-background', '#ffffff');
      root.style.setProperty('--theme-text-primary', '#0f0f0f');
      root.style.setProperty('--theme-text-secondary', '#6b7280');
    }

    // Update body class for theme-specific styling
    document.body.className = isDark ? 'theme-dark' : 'theme-light';
  }, [isDark]);

  // Theme utility functions
  const getColor = (colorPath: string): string => {
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

  const getSpacing = (size: keyof typeof theme.spacing): string => {
    return theme.spacing[size];
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (dark: boolean) => {
    setIsDark(dark);
  };

  const contextValue: ThemeContextType = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    getColor,
    getSpacing,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook to use theme context
 * 
 * @returns Theme context value
 * @throws Error if used outside ThemeProvider
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
};

/**
 * Hook to get theme colors
 * 
 * @returns Object with theme colors
 */
export const useThemeColors = () => {
  const { theme } = useTheme();
  return theme.colors;
};

/**
 * Hook to get theme typography
 * 
 * @returns Object with theme typography
 */
export const useThemeTypography = () => {
  const { theme } = useTheme();
  return theme.typography;
};

/**
 * Hook to get theme spacing
 * 
 * @returns Object with theme spacing
 */
export const useThemeSpacing = () => {
  const { theme } = useTheme();
  return theme.spacing;
};

export default ThemeProvider;
