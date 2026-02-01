/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: use-debounce.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: Hook لتأخير تنفيذ الدوال
 * 🔧 الغرض: تحسين الأداء بتأخير تنفيذ العمليات المكلفة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseDebounceOptions {
  /** المدة بالمللي ثانية */
  delay: number;

  /** تنفيذ على الفور للاستدعاء الأول */
  leading?: boolean;

  /** تنفيذ بعد انتهاء المهلة */
  trailing?: boolean;
}

export interface UseDebounceResult<T> {
  /** القيمة المتأخرة */
  value: T;

  /** حالة الانتظار */
  isPending: boolean;

  /** إلغاء التأخير */
  cancel: () => void;

  /** تنفيذ فوري */
  flush: () => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useDebounce
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useDebounceCallback
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useDebounceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  options: UseDebounceOptions | number = 500,
): [(...args: Parameters<T>) => void, () => void] {
  const delay = typeof options === 'number' ? options : options.delay;
  const leading = typeof options === 'object' ? options.leading : false;
  const trailing = typeof options === 'object' ? (options.trailing ?? true) : true;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const leadingRef = useRef(true);

  // تحديث callback المرجعي
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // تنظيف المؤقت
  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  // الدالة المتأخرة
  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      const invoke = () => {
        callbackRef.current(...args);
        leadingRef.current = true;
      };

      // تنفيذ على الفور إذا كان leading
      if (leading && leadingRef.current) {
        leadingRef.current = false;
        invoke();

        return;
      }

      // إلغاء المؤقت السابق
      clear();

      // إنشاء مؤقت جديد
      if (trailing) {
        timeoutRef.current = setTimeout(invoke, delay);
      }
    },
    [delay, leading, trailing, clear],
  );

  // تنظيف عند إلغاء التثبيت
  useEffect(() => {
    return clear;
  }, [clear]);

  return [debouncedCallback, clear];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useDebounceState
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useDebounceState<T>(
  initialValue: T,
  delay: number = 500,
): [T, T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  const setDebouncedState = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue((prev) => (newValue instanceof Function ? newValue(prev) : newValue));
  }, []);

  return [value, debouncedValue, setDebouncedState];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useDebounceFn
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useDebounceFn<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number = 500,
): {
  run: (...args: Parameters<T>) => void;
  cancel: () => void;
  flush: () => void;
  pending: boolean;
} {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fnRef = useRef(fn);
  const pendingRef = useRef(false);
  const argsRef = useRef<Parameters<T> | null>(null);

  const [, forceUpdate] = useState({});

  useEffect(() => {
    fnRef.current = fn;
  }, [fn]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      pendingRef.current = false;
      forceUpdate({});
    }
  }, []);

  const flush = useCallback(() => {
    if (timeoutRef.current && argsRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
      fnRef.current(...argsRef.current);
      pendingRef.current = false;
      forceUpdate({});
    }
  }, []);

  const run = useCallback(
    (...args: Parameters<T>) => {
      argsRef.current = args;
      pendingRef.current = true;
      forceUpdate({});

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fnRef.current(...args);
        pendingRef.current = false;
        forceUpdate({});
      }, delay);
    },
    [delay],
  );

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return {
    run,
    cancel,
    flush,
    get pending() {
      return pendingRef.current;
    },
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useThrottle
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useThrottle<T>(value: T, limit: number = 500): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRun = now - lastRan.current;

    if (timeSinceLastRun >= limit) {
      setThrottledValue(value);
      lastRan.current = now;
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }, limit - timeSinceLastRun);

      return () => clearTimeout(timer);
    }
  }, [value, limit]);

  return throttledValue;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useThrottleCallback
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useThrottleCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  limit: number = 500,
): [(...args: Parameters<T>) => void, () => void] {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  const lastRan = useRef<number>(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const clear = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      const timeSinceLastRun = now - lastRan.current;

      const invoke = () => {
        callbackRef.current(...args);
        lastRan.current = now;
      };

      clear();

      if (timeSinceLastRun >= limit) {
        invoke();
      } else {
        timeoutRef.current = setTimeout(invoke, limit - timeSinceLastRun);
      }
    },
    [limit, clear],
  );

  useEffect(() => {
    return clear;
  }, [clear]);

  return [throttledCallback, clear];
}
