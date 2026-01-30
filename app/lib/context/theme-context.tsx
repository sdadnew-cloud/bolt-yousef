/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: theme-context.tsx
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: سياق إدارة المظهر (فاتح/داكن/نظام)
 * 🔧 الغرض: توفير إدارة مركزية للمظهر عبر التطبيق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeContextValue {
  /** المظهر المحدد */
  theme: Theme;
  /** المظهر الفعلي المطبق */
  resolvedTheme: ResolvedTheme;
  /** تعيين المظهر */
  setTheme: (theme: Theme) => void;
  /** تبديل المظهر */
  toggleTheme: () => void;
  /** هل المظهر الحالي داكن */
  isDark: boolean;
  /** هل المظهر الحالي فاتح */
  isLight: boolean;
}

export interface ThemeProviderProps {
  /** العناصر الفرعية */
  children: React.ReactNode;
  /** المظهر الافتراضي */
  defaultTheme?: Theme;
  /** مفتاح التخزين المحلي */
  storageKey?: string;
  /** تطبيق المظهر على عنصر محدد */
  attribute?: string;
  /** تطبيق class بدلاً من attribute */
  enableSystem?: boolean;
  /** تعطيل التحولات عند تغيير المظهر */
  disableTransitionOnChange?: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 إنشاء السياق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 ThemeProvider
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'theme',
  attribute = 'data-theme',
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [mounted, setMounted] = useState(false);

  // قراءة المظهر المخزن عند التحميل
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
    setMounted(true);
  }, [storageKey]);

  // تحديد المظهر الفعلي
  useEffect(() => {
    if (!mounted) return;

    const resolveTheme = (): ResolvedTheme => {
      if (theme === 'system' && enableSystem) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
      return theme as ResolvedTheme;
    };

    const resolved = resolveTheme();
    setResolvedTheme(resolved);

    // تطبيق المظهر على document
    const root = document.documentElement;

    // تعطيل التحولات مؤقتاً
    if (disableTransitionOnChange) {
      const css = document.createElement('style');
      css.textContent = '* { transition: none !important; }';
      document.head.appendChild(css);

      requestAnimationFrame(() => {
        document.head.removeChild(css);
      });
    }

    // تطبيق المظهر
    if (attribute === 'class') {
      root.classList.remove('light', 'dark');
      root.classList.add(resolved);
    } else {
      root.setAttribute(attribute, resolved);
    }
  }, [theme, mounted, attribute, enableSystem, disableTransitionOnChange]);

  // الاستماع لتغييرات نظام المظهر
  useEffect(() => {
    if (!enableSystem || theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = () => {
      const resolved = mediaQuery.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);

      const root = document.documentElement;
      if (attribute === 'class') {
        root.classList.remove('light', 'dark');
        root.classList.add(resolved);
      } else {
        root.setAttribute(attribute, resolved);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme, enableSystem, attribute]);

  // تعيين المظهر
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      localStorage.setItem(storageKey, newTheme);
    },
    [storageKey]
  );

  // تبديل المظهر
  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem(storageKey, newTheme);
      return newTheme;
    });
  }, [storageKey]);

  const value: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  };

  // منع وميض المظهر
  if (!mounted) {
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('${storageKey}') || '${defaultTheme}';
                const resolved = theme === 'system' 
                  ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                  : theme;
                document.documentElement.setAttribute('${attribute}', resolved);
              })();
            `,
          }}
        />
        {children}
      </>
    );
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useTheme
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useResolvedTheme
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useResolvedTheme(): ResolvedTheme {
  return useTheme().resolvedTheme;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 مكون ThemeToggle
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface ThemeToggleProps {
  /** حجم الزر */
  size?: 'sm' | 'md' | 'lg';
  /** تنسيق مخصص */
  className?: string;
}

export function ThemeToggle({ size = 'md', className = '' }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  return (
    <button
      onClick={toggleTheme}
      className={`
        ${sizeClasses[size]}
        flex items-center justify-center
        rounded-lg
        bg-gray-100 dark:bg-gray-800
        text-gray-700 dark:text-gray-300
        hover:bg-gray-200 dark:hover:bg-gray-700
        transition-colors duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
      aria-label={resolvedTheme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
      title={resolvedTheme === 'dark' ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
    >
      {resolvedTheme === 'dark' ? (
        // أيقونة الشمس
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // أيقونة القمر
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 مكون ThemeSelector
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'فاتح', icon: '☀️' },
    { value: 'dark', label: 'داكن', icon: '🌙' },
    { value: 'system', label: 'النظام', icon: '💻' },
  ];

  return (
    <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {themes.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md
            text-sm font-medium
            transition-all duration-200
            ${
              theme === value
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }
          `}
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
}
