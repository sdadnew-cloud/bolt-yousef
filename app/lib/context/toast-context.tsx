/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: toast-context.tsx
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: سياق إدارة الإشعارات المنبثقة (Toast Notifications)
 * 🔧 الغرض: توفير نظام مركزي لعرض الإشعارات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  /** معرف فريد */
  id: string;
  /** نوع الإشعار */
  type: ToastType;
  /** عنوان الإشعار */
  title?: string;
  /** نص الإشعار */
  message: string;
  /** مدة العرض بالمللي ثانية */
  duration?: number;
  /** هل يمكن إغلاقه */
  dismissible?: boolean;
  /** إجراء إضافي */
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextValue {
  /** عرض إشعار نجاح */
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  /** عرض إشعار خطأ */
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  /** عرض إشعار تحذير */
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  /** عرض إشعار معلومات */
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => string;
  /** إزالة إشعار */
  dismiss: (id: string) => void;
  /** إزالة جميع الإشعارات */
  dismissAll: () => void;
  /** قائمة الإشعارات الحالية */
  toasts: Toast[];
}

export interface ToastOptions {
  type?: ToastType;
  title?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastProviderProps {
  /** العناصر الفرعية */
  children: React.ReactNode;
  /** الحد الأقصى للإشعارات */
  maxToasts?: number;
  /** المدة الافتراضية */
  defaultDuration?: number;
  /** موقع الإشعارات */
  position?: ToastPosition;
}

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 إنشاء السياق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔔 ToastProvider
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function ToastProvider({
  children,
  maxToasts = 5,
  defaultDuration = 5000,
  position = 'bottom-right',
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // إزالة إشعار
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
    
    // إلغاء المؤقت
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  // إزالة جميع الإشعارات
  const dismissAll = useCallback(() => {
    setToasts([]);
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
  }, []);

  // إضافة إشعار
  const addToast = useCallback(
    (message: string, options: ToastOptions = {}): string => {
      const id = Math.random().toString(36).substring(2, 9);
      const {
        type = 'info',
        title,
        duration = defaultDuration,
        dismissible = true,
        action,
      } = options;

      const toast: Toast = {
        id,
        type,
        title,
        message,
        duration,
        dismissible,
        action,
      };

      setToasts((prev) => {
        const newToasts = [...prev, toast];
        // الحفاظ على الحد الأقصى
        if (newToasts.length > maxToasts) {
          const removed = newToasts.shift();
          if (removed) {
            const timer = timersRef.current.get(removed.id);
            if (timer) {
              clearTimeout(timer);
              timersRef.current.delete(removed.id);
            }
          }
        }
        return newToasts;
      });

      // إعداد مؤقت الإزالة
      if (duration > 0) {
        const timer = setTimeout(() => {
          dismiss(id);
        }, duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [defaultDuration, maxToasts, dismiss]
  );

  // دوال مساعدة
  const success = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type: 'success' }),
    [addToast]
  );

  const error = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type: 'error' }),
    [addToast]
  );

  const warning = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type: 'warning' }),
    [addToast]
  );

  const info = useCallback(
    (message: string, options?: Omit<ToastOptions, 'type'>) =>
      addToast(message, { ...options, type: 'info' }),
    [addToast]
  );

  const value: ToastContextValue = {
    success,
    error,
    warning,
    info,
    dismiss,
    dismissAll,
    toasts,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} position={position} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useToast
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 ToastContainer
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface ToastContainerProps {
  toasts: Toast[];
  position: ToastPosition;
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, position, onDismiss }: ToastContainerProps) {
  const positionClasses: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`fixed z-50 flex flex-col gap-2 ${positionClasses[position]}`}
      style={{ pointerEvents: 'none' }}
    >
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 ToastItem
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const { id, type, title, message, dismissible, action } = toast;

  const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-500',
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      icon: 'text-red-500',
    },
    warning: {
      bg: 'bg-yellow-50 dark:bg-yellow-900/20',
      border: 'border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-500',
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500',
    },
  };

  const icons: Record<ToastType, React.ReactNode> = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  const style = typeStyles[type];

  return (
    <div
      className={`
        pointer-events-auto
        min-w-[300px] max-w-md
        p-4 rounded-lg shadow-lg
        border ${style.bg} ${style.border}
        transform transition-all duration-300
        animate-slide-in
        flex items-start gap-3
      `}
      role="alert"
    >
      <div className={`flex-shrink-0 ${style.icon}`}>{icons[type]}</div>
      
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {title}
          </h4>
        )}
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
        
        {action && (
          <button
            onClick={action.onClick}
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {action.label}
          </button>
        )}
      </div>

      {dismissible && (
        <button
          onClick={() => onDismiss(id)}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="إغلاق"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 مكون ToastViewport
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function ToastViewport({ position = 'bottom-right' }: { position?: ToastPosition }) {
  const { toasts, dismiss } = useToast();
  return <ToastContainer toasts={toasts} position={position} onDismiss={dismiss} />;
}
