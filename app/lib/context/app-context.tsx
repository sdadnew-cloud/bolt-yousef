/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: app-context.tsx
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: سياق التطبيق الرئيسي (Main App Context)
 * 🔧 الغرض: إدارة الحالة العالمية للتطبيق وتوفيرها لجميع المكونات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface AppState {
  theme: 'light' | 'dark' | 'system';
  isSidebarOpen: boolean;
  activeLanguage: string;
  isSettingsOpen: boolean;
  isLoading: boolean;
  user: any | null;
}

export type AppAction =
  | { type: 'SET_THEME'; payload: AppState['theme'] }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_LANGUAGE'; payload: string }
  | { type: 'TOGGLE_SETTINGS' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: any | null };

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏗️ الحالة الافتراضية والـ Reducer
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const initialState: AppState = {
  theme: 'system',
  isSidebarOpen: true,
  activeLanguage: 'ar',
  isSettingsOpen: false,
  isLoading: false,
  user: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
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
    default:
      return state;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🗳️ إنشاء السياق (Context)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  toggleSidebar: () => void;
  setTheme: (theme: AppState['theme']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 موفر السياق (Provider Component)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleSidebar = useCallback(() => {
    dispatch({ type: 'TOGGLE_SIDEBAR' });
  }, []);

  const setTheme = useCallback((theme: AppState['theme']) => {
    dispatch({ type: 'SET_THEME', payload: theme });
  }, []);

  const value = {
    state,
    dispatch,
    toggleSidebar,
    setTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook لاستخدام السياق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const useApp = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }

  return context;
};
