/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: use-toggle.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: Hook للتبديل بين الحالات
 * 🔧 الغرض: تبسيط إدارة الحالات الثنائية (true/false)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseToggleReturn {
  /** القيمة الحالية */
  value: boolean;
  /** تبديل القيمة */
  toggle: () => void;
  /** تعيين القيمة إلى true */
  setOn: () => void;
  /** تعيين القيمة إلى false */
  setOff: () => void;
  /** تعيين قيمة محددة */
  set: (value: boolean) => void;
  /** إعادة تعيين للقيمة الافتراضية */
  reset: () => void;
}

export interface UseToggleOptions {
  /** القيمة الافتراضية */
  defaultValue?: boolean;
  /** القيمة عند إعادة التعيين */
  resetValue?: boolean;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useToggle
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useToggle(
  initialValue: boolean = false,
  options: UseToggleOptions = {}
): UseToggleReturn {
  const { defaultValue = initialValue, resetValue = initialValue } = options;

  const [value, setValue] = useState<boolean>(defaultValue);

  const toggle = useCallback(() => {
    setValue((prev) => !prev);
  }, []);

  const setOn = useCallback(() => {
    setValue(true);
  }, []);

  const setOff = useCallback(() => {
    setValue(false);
  }, []);

  const set = useCallback((newValue: boolean) => {
    setValue(newValue);
  }, []);

  const reset = useCallback(() => {
    setValue(resetValue);
  }, [resetValue]);

  return {
    value,
    toggle,
    setOn,
    setOff,
    set,
    reset,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useBoolean (بديل لـ useToggle)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useBoolean(
  initialValue: boolean = false
): [
  boolean,
  {
    toggle: () => void;
    on: () => void;
    off: () => void;
    set: (value: boolean) => void;
    reset: () => void;
  }
] {
  const [value, setValue] = useState<boolean>(initialValue);

  const toggle = useCallback(() => setValue((v) => !v), []);
  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const set = useCallback((v: boolean) => setValue(v), []);
  const reset = useCallback(() => setValue(initialValue), [initialValue]);

  return [value, { toggle, on, off, set, reset }];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useCycle
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useCycle<T>(
  values: T[],
  initialIndex: number = 0
): [T, () => void, (index: number) => void] {
  const [index, setIndex] = useState<number>(initialIndex);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % values.length);
  }, [values.length]);

  const goTo = useCallback((newIndex: number) => {
    setIndex(Math.max(0, Math.min(newIndex, values.length - 1)));
  }, [values.length]);

  return [values[index], next, goTo];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useSet
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseSetReturn<T> {
  /** المجموعة */
  values: Set<T>;
  /** إضافة عنصر */
  add: (value: T) => void;
  /** إزالة عنصر */
  remove: (value: T) => void;
  /** تبديل عنصر (إضافة إذا غير موجود، إزالة إذا موجود) */
  toggle: (value: T) => void;
  /** التحقق من وجود عنصر */
  has: (value: T) => boolean;
  /** إفراغ المجموعة */
  clear: () => void;
  /** إعادة تعيين للقيمة الافتراضية */
  reset: () => void;
  /** عدد العناصر */
  size: number;
}

export function useSet<T>(initialValues: T[] = []): UseSetReturn<T> {
  const [values, setValues] = useState<Set<T>>(new Set(initialValues));

  const add = useCallback((value: T) => {
    setValues((prev) => new Set([...prev, value]));
  }, []);

  const remove = useCallback((value: T) => {
    setValues((prev) => {
      const next = new Set(prev);
      next.delete(value);
      return next;
    });
  }, []);

  const toggle = useCallback((value: T) => {
    setValues((prev) => {
      const next = new Set(prev);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }, []);

  const has = useCallback(
    (value: T) => values.has(value),
    [values]
  );

  const clear = useCallback(() => {
    setValues(new Set());
  }, []);

  const reset = useCallback(() => {
    setValues(new Set(initialValues));
  }, [initialValues]);

  return {
    values,
    add,
    remove,
    toggle,
    has,
    clear,
    reset,
    size: values.size,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useCounter
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseCounterOptions {
  /** القيمة الافتراضية */
  initial?: number;
  /** الحد الأدنى */
  min?: number;
  /** الحد الأقصى */
  max?: number;
  /** خطوة الزيادة/النقصان */
  step?: number;
}

export interface UseCounterReturn {
  /** القيمة الحالية */
  count: number;
  /** زيادة القيمة */
  increment: () => void;
  /** نقصان القيمة */
  decrement: () => void;
  /** إضافة قيمة */
  add: (value: number) => void;
  /** طرح قيمة */
  subtract: (value: number) => void;
  /** تعيين قيمة محددة */
  set: (value: number) => void;
  /** إعادة تعيين */
  reset: () => void;
}

export function useCounter(options: UseCounterOptions = {}): UseCounterReturn {
  const { initial = 0, min, max, step = 1 } = options;

  const [count, setCount] = useState<number>(initial);

  const clamp = useCallback(
    (value: number) => {
      let clamped = value;
      if (min !== undefined) clamped = Math.max(min, clamped);
      if (max !== undefined) clamped = Math.min(max, clamped);
      return clamped;
    },
    [min, max]
  );

  const increment = useCallback(() => {
    setCount((prev) => clamp(prev + step));
  }, [clamp, step]);

  const decrement = useCallback(() => {
    setCount((prev) => clamp(prev - step));
  }, [clamp, step]);

  const add = useCallback(
    (value: number) => {
      setCount((prev) => clamp(prev + value));
    },
    [clamp]
  );

  const subtract = useCallback(
    (value: number) => {
      setCount((prev) => clamp(prev - value));
    },
    [clamp]
  );

  const set = useCallback(
    (value: number) => {
      setCount(clamp(value));
    },
    [clamp]
  );

  const reset = useCallback(() => {
    setCount(initial);
  }, [initial]);

  return {
    count,
    increment,
    decrement,
    add,
    subtract,
    set,
    reset,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useMap
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseMapReturn<K, V> {
  /** الخريطة */
  map: Map<K, V>;
  /** تعيين قيمة */
  set: (key: K, value: V) => void;
  /** الحصول على قيمة */
  get: (key: K) => V | undefined;
  /** إزالة عنصر */
  remove: (key: K) => void;
  /** التحقق من وجود مفتاح */
  has: (key: K) => boolean;
  /** إفراغ الخريطة */
  clear: () => void;
  /** إعادة تعيين */
  reset: () => void;
  /** عدد العناصر */
  size: number;
}

export function useMap<K, V>(
  initialEntries: [K, V][] = []
): UseMapReturn<K, V> {
  const [map, setMap] = useState<Map<K, V>>(new Map(initialEntries));

  const set = useCallback((key: K, value: V) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.set(key, value);
      return next;
    });
  }, []);

  const get = useCallback(
    (key: K) => map.get(key),
    [map]
  );

  const remove = useCallback((key: K) => {
    setMap((prev) => {
      const next = new Map(prev);
      next.delete(key);
      return next;
    });
  }, []);

  const has = useCallback(
    (key: K) => map.has(key),
    [map]
  );

  const clear = useCallback(() => {
    setMap(new Map());
  }, []);

  const reset = useCallback(() => {
    setMap(new Map(initialEntries));
  }, [initialEntries]);

  return {
    map,
    set,
    get,
    remove,
    has,
    clear,
    reset,
    size: map.size,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useList
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseListReturn<T> {
  /** القائمة */
  list: T[];
  /** إضافة عنصر في النهاية */
  push: (item: T) => void;
  /** إضافة عنصر في البداية */
  unshift: (item: T) => void;
  /** إزالة العنصر الأخير */
  pop: () => T | undefined;
  /** إزالة العنصر الأول */
  shift: () => T | undefined;
  /** إزالة عنصر في فهرس معين */
  removeAt: (index: number) => void;
  /** إدراج عنصر في فهرس معين */
  insertAt: (index: number, item: T) => void;
  /** تحديث عنصر في فهرس معين */
  updateAt: (index: number, item: T) => void;
  /** تبديل عنصرين */
  swap: (index1: number, index2: number) => void;
  /** تفريغ القائمة */
  clear: () => void;
  /** إعادة تعيين */
  reset: () => void;
  /** عدد العناصر */
  length: number;
}

export function useList<T>(initialList: T[] = []): UseListReturn<T> {
  const [list, setList] = useState<T[]>(initialList);

  const push = useCallback((item: T) => {
    setList((prev) => [...prev, item]);
  }, []);

  const unshift = useCallback((item: T) => {
    setList((prev) => [item, ...prev]);
  }, []);

  const pop = useCallback((): T | undefined => {
    let removed: T | undefined;
    setList((prev) => {
      removed = prev[prev.length - 1];
      return prev.slice(0, -1);
    });
    return removed;
  }, []);

  const shift = useCallback((): T | undefined => {
    let removed: T | undefined;
    setList((prev) => {
      removed = prev[0];
      return prev.slice(1);
    });
    return removed;
  }, []);

  const removeAt = useCallback((index: number) => {
    setList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const insertAt = useCallback((index: number, item: T) => {
    setList((prev) => [...prev.slice(0, index), item, ...prev.slice(index)]);
  }, []);

  const updateAt = useCallback((index: number, item: T) => {
    setList((prev) =>
      prev.map((current, i) => (i === index ? item : current))
    );
  }, []);

  const swap = useCallback((index1: number, index2: number) => {
    setList((prev) => {
      if (
        index1 < 0 ||
        index1 >= prev.length ||
        index2 < 0 ||
        index2 >= prev.length
      ) {
        return prev;
      }
      const next = [...prev];
      [next[index1], next[index2]] = [next[index2], next[index1]];
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setList([]);
  }, []);

  const reset = useCallback(() => {
    setList(initialList);
  }, [initialList]);

  return {
    list,
    push,
    unshift,
    pop,
    shift,
    removeAt,
    insertAt,
    updateAt,
    swap,
    clear,
    reset,
    length: list.length,
  };
}
