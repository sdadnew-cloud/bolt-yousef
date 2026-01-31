/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: hooks/index.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: ملف التصدير الرئيسي للـ Hooks
 * 🔧 الغرض: توفير واجهة موحدة للوصول إلى جميع الـ Hooks
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 Hooks الموجودة مسبقاً
// ═══════════════════════════════════════════════════════════════════════════════
export * from './useMessageParser';
export * from './usePromptEnhancer';
export * from './useShortcuts';
export * from './StickToBottom';
export * from './useEditChatDescription';
export { default } from './useViewport';
export { useFeatures } from './useFeatures';
export { useNotifications } from './useNotifications';
export { useConnectionStatus } from './useConnectionStatus';
export { useGitHubConnection } from './useGitHubConnection';
export { useGitHubStats } from './useGitHubStats';
export { useGitLabConnection } from './useGitLabConnection';
export { useGitLabAPI } from './useGitLabAPI';
export { useSupabaseConnection } from './useSupabaseConnection';
export { useConnectionTest } from './useConnectionTest';

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 Hooks الجديدة - التخزين المحلي
// ═══════════════════════════════════════════════════════════════════════════════
export {
  useLocalStorage,
  useSessionStorage,
  useStorage,
  type StorageType,
  type UseLocalStorageOptions,
} from './use-local-storage';

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 Hooks الجديدة - التأخير والتنظيم
// ═══════════════════════════════════════════════════════════════════════════════
export {
  useDebounce,
  useDebounceCallback,
  useDebounceState,
  useDebounceFn,
  useThrottle,
  useThrottleCallback,
  type UseDebounceOptions,
} from './use-debounce';

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 Hooks الجديدة - استعلامات الوسائط
// ═══════════════════════════════════════════════════════════════════════════════
export {
  useMediaQuery,
  useBreakpoint,
  useIsMobile,
  useIsTablet,
  useIsDesktop,
  useScreenSize,
  useOrientation,
  usePrefersColorScheme,
  usePrefersReducedMotion,
  useHover,
  useFocus,
  useActive,
  useResponsiveValue,
  usePrint,
  useTouch,
  usePointer,
  type Breakpoint,
  type BreakpointValues,
  type ScreenSize,
  type Orientation,
  type ColorScheme,
  type PointerType,
  defaultBreakpoints,
} from './use-media-query';

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 Hooks الجديدة - العمليات غير المتزامنة
// ═══════════════════════════════════════════════════════════════════════════════
export {
  useAsync,
  useAsyncFn,
  useFetch,
  useMutation,
  usePromise,
  useRetry,
  type AsyncStatus,
  type AsyncState,
  type UseAsyncOptions,
  type UseAsyncReturn,
  type UseFetchOptions,
  type UseMutationOptions,
  type UseRetryOptions,
} from './use-async';

// ═══════════════════════════════════════════════════════════════════════════════
// 📦 Hooks الجديدة - التبديل والحالات
// ═══════════════════════════════════════════════════════════════════════════════
export {
  useToggle,
  useBoolean,
  useCycle,
  useSet,
  useCounter,
  useMap,
  useList,
  type UseToggleReturn,
  type UseToggleOptions,
  type UseSetReturn,
  type UseCounterOptions,
  type UseCounterReturn,
  type UseMapReturn,
  type UseListReturn,
} from './use-toggle';
