/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: app-context.tsx
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: سياق التطبيق الرئيسي (Main App Context)
 * 🔧 الغرض: إدارة الحالة العالمية للتطبيق وتوفيرها لجميع المكونات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, useState, type ReactNode } from 'react';
import { useStore } from '@nanostores/react';
import { themeStore, type Theme } from '~/lib/stores/theme';
import { useSettings as useSettingsHook } from '~/lib/hooks/useSettings';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface AppSettings {
  theme: Theme;
  language: string;
  notifications: boolean;
  eventLogs: boolean;
  timezone: string;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface AppState {
  isReady: boolean;
  isOffline: boolean;
  theme: Theme;
  isSidebarOpen: boolean;
  activeLanguage: string;
  isSettingsOpen: boolean;
  isLoading: boolean;
  user: UserInfo | null;
  settings: AppSettings;
}

export type AppAction =
  | { type: 'SET_READY'; payload: boolean }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_THEME'; payload: Theme }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: UserInfo | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> };

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏗️ الحالة الافتراضية والـ Reducer
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const initialState: AppState = {
  isReady: false,
  isOffline: false,
  theme: 'light',
  isSidebarOpen: true,
  activeLanguage: 'ar',
  isSettingsOpen: false,
  isLoading: false,
  user: null,
  settings: {
    theme: 'light',
    language: 'ar',
    notifications: true,
    eventLogs: true,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_READY':
      return { ...state, isReady: action.payload };
    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };
    case 'SET_THEME':
      return { ...state, theme: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, isSidebarOpen: !state.isSidebarOpen };
    case 'SET_SIDEBAR':
      return { ...state, isSidebarOpen: action.payload };
    case 'SET_LANGUAGE':
      return { ...state, activeLanguage: action.payload };
    case 'TOGGLE_SETTINGS':
      return { ...state, isSettingsOpen: !state.isSettingsOpen };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    default:
      return state;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🗳️ إنشاء السياق (Context)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  toggleSidebar: () => void;
  setTheme: (theme: Theme) => void;
  isReady: boolean;
  isOffline: boolean;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 موفر السياق (Provider Component)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    theme: themeStore.get(),
  });

  const theme = useStore(themeStore);

  // تحديث الحالة عند تغيير الثيم في المتجر
  useEffect(() => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, [theme]);

  // إدارة حالة الاتصال
  useEffect(() => {
    const handleOnline = () => dispatch({ type: 'SET_OFFLINE', payload: false });
    const handleOffline = () => dispatch({ type: 'SET_OFFLINE', payload: true });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    dispatch({ type: 'SET_OFFLINE', payload: !navigator.onLine });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // التطبيق جاهز بعد التحميل الأولي
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'SET_READY', payload: true });
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    themeStore.set(newTheme);
  }, []);

  const value: AppContextValue = {
    state,
    dispatch,
    toggleSidebar,
    setTheme,
    isReady: state.isReady,
    isOffline: state.isOffline,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hooks للوصول إلى السياق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const useApp = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};

export const useAppState = () => useApp().state;
export const useIsReady = () => useApp().isReady;
export const useIsLoading = () => useApp().state.isLoading;
export const useUser = () => useApp().state.user;
export const useSettings = useSettingsHook;

export const AppInitializer: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isReady = useIsReady();

  if (!isReady) {
    return <div className="flex items-center justify-center h-screen">Loading yousef sh Platform...</div>;
  }

  return <>{children}</>;
};

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = useApp();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-md shadow-lg z-[9999]">
      You are offline. Some features may be unavailable.
    </div>
  );
};

export const AppErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <>{children}</>; // Simplified for now
};

export type AppProviderProps = { children: ReactNode };
export type AppInitializerProps = { children: ReactNode };
export type AppError = Error;
