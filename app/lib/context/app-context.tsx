/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: app-context.tsx
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: سياق حالة التطبيق العامة
 * 🔧 الغرض: توفير إدارة مركزية لحالة التطبيق المشتركة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface AppState {
  /** هل التطبيق جاهز */
  isReady: boolean;
  /** هل التطبيق في وضع عدم الاتصال */
  isOffline: boolean;
  /** حالة التحميل العامة */
  isLoading: boolean;
  /** رسالة التحميل */
  loadingMessage: string;
  /** معلومات المستخدم */
  user: UserInfo | null;
  /** الإعدادات */
  settings: AppSettings;
  /** آخر خطأ */
  lastError: AppError | null;
}

export interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'user' | 'admin' | 'guest';
}

export interface AppSettings {
  language: string;
  direction: 'rtl' | 'ltr';
  notifications: boolean;
  autoSave: boolean;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;
}

export interface AppError {
  code: string;
  message: string;
  timestamp: number;
}

export type AppAction =
  | { type: 'SET_READY'; payload: boolean }
  | { type: 'SET_OFFLINE'; payload: boolean }
  | { type: 'SET_LOADING'; payload: { isLoading: boolean; message?: string } }
  | { type: 'SET_USER'; payload: UserInfo | null }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'SET_ERROR'; payload: AppError | null }
  | { type: 'RESET_STATE' };

export interface AppContextValue {
  /** حالة التطبيق */
  state: AppState;
  /** dispatch للإجراءات */
  dispatch: React.Dispatch<AppAction>;
  /** تعيين حالة الجاهزية */
  setReady: (ready: boolean) => void;
  /** تعيين حالة الاتصال */
  setOffline: (offline: boolean) => void;
  /** بدء التحميل */
  startLoading: (message?: string) => void;
  /** إيقاف التحميل */
  stopLoading: () => void;
  /** تعيين المستخدم */
  setUser: (user: UserInfo | null) => void;
  /** تحديث الإعدادات */
  updateSettings: (settings: Partial<AppSettings>) => void;
  /** تعيين خطأ */
  setError: (error: AppError | null) => void;
  /** إعادة تعيين الحالة */
  resetState: () => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏛️ الحالة الافتراضية
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const defaultSettings: AppSettings = {
  language: 'ar',
  direction: 'rtl',
  notifications: true,
  autoSave: true,
  fontSize: 'medium',
  sidebarCollapsed: false,
};

const initialState: AppState = {
  isReady: false,
  isOffline: false,
  isLoading: false,
  loadingMessage: '',
  user: null,
  settings: defaultSettings,
  lastError: null,
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔄 Reducer
 * ═══════════════════════════════════════════════════════════════════════════════
 */

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_READY':
      return { ...state, isReady: action.payload };

    case 'SET_OFFLINE':
      return { ...state, isOffline: action.payload };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading,
        loadingMessage: action.payload.message || '',
      };

    case 'SET_USER':
      return { ...state, user: action.payload };

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      };

    case 'SET_ERROR':
      return { ...state, lastError: action.payload };

    case 'RESET_STATE':
      return { ...initialState, settings: state.settings };

    default:
      return state;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 إنشاء السياق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 AppProvider
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface AppProviderProps {
  children: ReactNode;
  initialSettings?: Partial<AppSettings>;
}

export function AppProvider({ children, initialSettings }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, {
    ...initialState,
    settings: { ...defaultSettings, ...initialSettings },
  });

  // دوال مساعدة
  const setReady = useCallback((ready: boolean) => {
    dispatch({ type: 'SET_READY', payload: ready });
  }, []);

  const setOffline = useCallback((offline: boolean) => {
    dispatch({ type: 'SET_OFFLINE', payload: offline });
  }, []);

  const startLoading = useCallback((message?: string) => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: true, message } });
  }, []);

  const stopLoading = useCallback(() => {
    dispatch({ type: 'SET_LOADING', payload: { isLoading: false } });
  }, []);

  const setUser = useCallback((user: UserInfo | null) => {
    dispatch({ type: 'SET_USER', payload: user });
  }, []);

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', payload: settings });
  }, []);

  const setError = useCallback((error: AppError | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const resetState = useCallback(() => {
    dispatch({ type: 'RESET_STATE' });
  }, []);

  const value: AppContextValue = {
    state,
    dispatch,
    setReady,
    setOffline,
    startLoading,
    stopLoading,
    setUser,
    updateSettings,
    setError,
    resetState,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useApp
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useAppState
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useAppState(): AppState {
  return useApp().state;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useUser
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useUser(): UserInfo | null {
  return useApp().state.user;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useSettings
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useSettings(): AppSettings {
  return useApp().state.settings;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useIsReady
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useIsReady(): boolean {
  return useApp().state.isReady;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useIsLoading
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useIsLoading(): { isLoading: boolean; message: string } {
  const { isLoading, loadingMessage } = useApp().state;
  return { isLoading, message: loadingMessage };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 مكون AppInitializer
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface AppInitializerProps {
  children: ReactNode;
  onInit?: () => Promise<void> | void;
  fallback?: ReactNode;
}

export function AppInitializer({
  children,
  onInit,
  fallback = <LoadingScreen />,
}: AppInitializerProps) {
  const { state, setReady } = useApp();

  React.useEffect(() => {
    const initialize = async () => {
      try {
        if (onInit) {
          await onInit();
        }
        setReady(true);
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };

    initialize();
  }, [onInit, setReady]);

  if (!state.isReady) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 LoadingScreen
 * ═══════════════════════════════════════════════════════════════════════════════
 */

function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 مكون OfflineIndicator
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function OfflineIndicator() {
  const { state } = useApp();

  if (!state.isOffline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white px-4 py-2 text-center text-sm">
      <span className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل.
      </span>
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 مكون ErrorBoundary
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              حدث خطأ غير متوقع
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              نعتذر عن هذا الخطأ. يرجى تحديث الصفحة أو المحاولة مرة أخرى.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              تحديث الصفحة
            </button>
          </div>
        </div>
      );
    }

    return <>{this.props.children}</>;
  }
}
