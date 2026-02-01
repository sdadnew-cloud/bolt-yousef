/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: use-local-storage.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: Hook لإدارة localStorage مع دعم TypeScript
 * 🔧 الغرض: توفير واجهة React للتعامل مع localStorage
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseLocalStorageOptions<T> {
  /** القيمة الافتراضية */
  defaultValue?: T;

  /** دالة لتحويل القيمة قبل الحفظ */
  serialize?: (value: T) => string;

  /** دالة لتحويل النص المخزن إلى قيمة */
  deserialize?: (value: string) => T;

  /** تنفيذ callback عند تغيير القيمة */
  onChange?: (value: T) => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useLocalStorage
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { defaultValue, serialize = JSON.stringify, deserialize = JSON.parse, onChange } = options;

  // قراءة القيمة المخزنة أو استخدام القيمة الافتراضية
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return defaultValue as T;
    }

    try {
      const item = window.localStorage.getItem(key);

      if (item) {
        return deserialize(item);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }

    return defaultValue as T;
  }, [key, defaultValue, deserialize]);

  // حالة القيمة
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // تحديث القيمة
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // السماح بالقيمة كدالة
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // حفظ في الحالة
        setStoredValue(valueToStore);

        // حفظ في localStorage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, serialize(valueToStore));
        }

        // تنفيذ callback
        onChange?.(valueToStore);
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serialize, onChange],
  );

  // إزالة القيمة
  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue as T);

      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  // الاستماع للتغييرات من نوافذ أخرى
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = deserialize(event.newValue);
          setStoredValue(newValue);
          onChange?.(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      } else if (event.key === key && event.newValue === null) {
        setStoredValue(defaultValue as T);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue, deserialize, onChange]);

  return [storedValue, setValue, removeValue];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useSessionStorage
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useSessionStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const { defaultValue, serialize = JSON.stringify, deserialize = JSON.parse, onChange } = options;

  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return defaultValue as T;
    }

    try {
      const item = window.sessionStorage.getItem(key);

      if (item) {
        return deserialize(item);
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
    }

    return defaultValue as T;
  }, [key, defaultValue, deserialize]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);

        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, serialize(valueToStore));
        }

        onChange?.(valueToStore);
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue, serialize, onChange],
  );

  const removeValue = useCallback(() => {
    try {
      setStoredValue(defaultValue as T);

      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          const newValue = deserialize(event.newValue);
          setStoredValue(newValue);
          onChange?.(newValue);
        } catch (error) {
          console.warn(`Error parsing sessionStorage change for key "${key}":`, error);
        }
      } else if (event.key === key && event.newValue === null) {
        setStoredValue(defaultValue as T);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, defaultValue, deserialize, onChange]);

  return [storedValue, setValue, removeValue];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useStorage (موحد)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type StorageType = 'local' | 'session';

export function useStorage<T>(
  key: string,
  type: StorageType = 'local',
  options: UseLocalStorageOptions<T> = {},
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const hook = type === 'local' ? useLocalStorage : useSessionStorage;
  return hook(key, options);
}
