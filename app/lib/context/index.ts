/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: context/index.ts
 * ━━━━━━━━━━━━━━━━━══════════════════════════════════════════════════════════════
 * 📝 وصف: ملف التصدير الرئيسي للسياقات
 * 🔧 الغرض: توفير واجهة موحدة للوصول إلى جميع السياقات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 تصدير سياق المظهر
// ═══════════════════════════════════════════════════════════════════════════════
export {
  ThemeProvider,
  useTheme,
  useResolvedTheme,
  ThemeToggle,
  ThemeSelector,
  type Theme,
  type ResolvedTheme,
  type ThemeContextValue,
  type ThemeProviderProps,
  type ThemeToggleProps,
} from './theme-context';

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 تصدير سياق الإشعارات
// ═══════════════════════════════════════════════════════════════════════════════
export {
  ToastProvider,
  useToast,
  ToastViewport,
  type Toast,
  type ToastType,
  type ToastContextValue,
  type ToastOptions,
  type ToastProviderProps,
  type ToastPosition,
} from './toast-context';

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 تصدير سياق التطبيق
// ═══════════════════════════════════════════════════════════════════════════════
export {
  AppProvider,
  useApp,
  useAppState,
  useUser,
  useSettings,
  useIsReady,
  useIsLoading,
  AppInitializer,
  OfflineIndicator,
  AppErrorBoundary,
  type AppState,
  type AppAction,
  type AppContextValue,
  type AppProviderProps,
  type AppSettings,
  type UserInfo,
  type AppError,
  type AppInitializerProps,
} from './app-context';
