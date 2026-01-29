import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { DesignScheme, defaultDesignScheme } from '~/types/design-scheme';
import { themeStore, applyDesignScheme } from '~/lib/stores/theme';

interface ThemeContextType {
  designScheme: DesignScheme;
  updateDesignScheme: (newScheme: Partial<DesignScheme>) => void;
  resetToDefault: () => void;
  currentTheme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [designScheme, setDesignScheme] = useState<DesignScheme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bolt_design_scheme');
      return saved ? JSON.parse(saved) : defaultDesignScheme;
    }
    return defaultDesignScheme;
  });

  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  // Update the theme when the theme store changes
  useEffect(() => {
    const unsubscribe = themeStore.listen((newTheme) => {
      setCurrentTheme(newTheme);
    });
    
    // Initial theme
    setCurrentTheme(themeStore.get());
    
    return unsubscribe;
  }, []);

  useEffect(() => {
    // Apply the design scheme to the DOM
    localStorage.setItem('bolt_design_scheme', JSON.stringify(designScheme));
    applyDesignScheme();
  }, [designScheme]);

  const updateDesignScheme = (newScheme: Partial<DesignScheme>) => {
    setDesignScheme(prev => ({
      ...prev,
      ...newScheme
    }));
  };

  const resetToDefault = () => {
    setDesignScheme(defaultDesignScheme);
    localStorage.removeItem('bolt_design_scheme');
  };

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    // Toggle the theme using the themeStore function
    const toggleFn = () => {
      const current = themeStore.get();
      const newThemeValue = current === 'dark' ? 'light' : 'dark';
      themeStore.set(newThemeValue);
      localStorage.setItem('bolt_theme', newThemeValue);
      document.querySelector('html')?.setAttribute('data-theme', newThemeValue);
    };
    toggleFn();
  };

  const value = {
    designScheme,
    updateDesignScheme,
    resetToDefault,
    currentTheme,
    toggleTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};