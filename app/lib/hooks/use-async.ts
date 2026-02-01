/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: use-async.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: Hook لإدارة العمليات غير المتزامنة
 * 🔧 الغرض: تبسيط إدارة حالات التحميل والأخطاء للعمليات غير المتزامنة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AsyncState<T> {
  /** حالة العملية */
  status: AsyncStatus;

  /** البيانات (في حالة النجاح) */
  data: T | null;

  /** الخطأ (في حالة الفشل) */
  error: Error | null;

  /** هل العملية قيد التنفيذ */
  isLoading: boolean;

  /** هل اكتملت العملية بنجاح */
  isSuccess: boolean;

  /** هل فشلت العملية */
  isError: boolean;
}

export interface UseAsyncOptions<T> {
  /** القيمة الافتراضية */
  initialData?: T;

  /** تنفيذ على الفور */
  immediate?: boolean;

  /** دالة معالجة الأخطاء */
  onError?: (error: Error) => void;

  /** دالة معالجة النجاح */
  onSuccess?: (data: T) => void;

  /** إلغاء العملية السابقة عند تنفيذ جديدة */
  cancelOnNew?: boolean;
}

export interface UseAsyncReturn<T, Args extends unknown[] = []> {
  /** حالة العملية */
  state: AsyncState<T>;

  /** تنفيذ العملية */
  execute: (...args: Args) => Promise<T>;

  /** إعادة تعيين الحالة */
  reset: () => void;

  /** إلغاء العملية الحالية */
  cancel: () => void;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useAsync
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useAsync<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {},
): UseAsyncReturn<T, Args> {
  const { initialData = null, immediate = false, onError, onSuccess, cancelOnNew = true } = options;

  const [state, setState] = useState<AsyncState<T>>({
    status: 'idle',
    data: initialData,
    error: null,
    isLoading: false,
    isSuccess: false,
    isError: false,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // تنظيف عند إلغاء التثبيت
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, []);

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const reset = useCallback(() => {
    cancel();
    setState({
      status: 'idle',
      data: initialData,
      error: null,
      isLoading: false,
      isSuccess: false,
      isError: false,
    });
  }, [initialData, cancel]);

  const execute = useCallback(
    async (...args: Args): Promise<T> => {
      // إلغاء العملية السابقة إذا لزم الأمر
      if (cancelOnNew) {
        cancel();
      }

      // إنشاء AbortController جديد
      abortControllerRef.current = new AbortController();

      // تحديث الحالة إلى loading
      setState((prev) => ({
        ...prev,
        status: 'loading',
        isLoading: true,
        isSuccess: false,
        isError: false,
        error: null,
      }));

      try {
        const result = await asyncFunction(...args);

        // التحقق من أن المكون لا يزال مثبتاً
        if (!isMountedRef.current) {
          return result;
        }

        setState({
          status: 'success',
          data: result,
          error: null,
          isLoading: false,
          isSuccess: true,
          isError: false,
        });

        onSuccess?.(result);

        return result;
      } catch (error) {
        // التحقق من أن المكون لا يزال مثبتاً وأن العملية لم تُلغَ
        if (!isMountedRef.current || abortControllerRef.current?.signal.aborted) {
          throw error;
        }

        const errorObject = error instanceof Error ? error : new Error(String(error));

        setState({
          status: 'error',
          data: null,
          error: errorObject,
          isLoading: false,
          isSuccess: false,
          isError: true,
        });

        onError?.(errorObject);
        throw errorObject;
      }
    },
    [asyncFunction, cancelOnNew, cancel, onSuccess, onError],
  );

  return {
    state,
    execute,
    reset,
    cancel,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useAsyncFn
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useAsyncFn<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseAsyncOptions<T> = {},
): [AsyncState<T>, (...args: Args) => Promise<T>, () => void] {
  const { state, execute, reset } = useAsync(asyncFunction, options);
  return [state, execute, reset];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useFetch
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseFetchOptions extends RequestInit {
  /** URL أساسي */
  baseUrl?: string;

  /** إعادة المحاولة عند الفشل */
  retry?: number;

  /** تأخير إعادة المحاولة */
  retryDelay?: number;
}

export function useFetch<T>(url: string | null, options: UseFetchOptions = {}): UseAsyncReturn<T, []> {
  const { baseUrl = '', retry = 0, retryDelay = 1000, ...fetchOptions } = options;

  const fetchData = useCallback(async (): Promise<T> => {
    if (!url) {
      throw new Error('URL is required');
    }

    const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retry; attempt++) {
      try {
        const response = await fetch(fullUrl, fetchOptions);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
          return (await response.json()) as T;
        }

        return (await response.text()) as unknown as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < retry) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }, [url, baseUrl, retry, retryDelay, fetchOptions]);

  return useAsync(fetchData, { immediate: url !== null });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useMutation
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseMutationOptions<T, Variables> {
  onSuccess?: (data: T, variables: Variables) => void;
  onError?: (error: Error, variables: Variables) => void;
  onSettled?: (data: T | null, error: Error | null, variables: Variables) => void;
}

export function useMutation<T, Variables = unknown>(
  mutationFn: (variables: Variables) => Promise<T>,
  options: UseMutationOptions<T, Variables> = {},
): UseAsyncReturn<T, [Variables]> & { mutate: (variables: Variables) => void } {
  const { onSuccess, onError, onSettled } = options;

  const wrappedMutation = useCallback(
    async (variables: Variables): Promise<T> => {
      try {
        const result = await mutationFn(variables);
        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);

        return result;
      } catch (error) {
        const errorObject = error instanceof Error ? error : new Error(String(error));
        onError?.(errorObject, variables);
        onSettled?.(null, errorObject, variables);
        throw errorObject;
      }
    },
    [mutationFn, onSuccess, onError, onSettled],
  );

  const asyncResult = useAsync(wrappedMutation);

  const mutate = useCallback(
    (variables: Variables) => {
      asyncResult.execute(variables).catch(() => {
        // الأخطاء تُعالج في wrappedMutation
      });
    },
    [asyncResult],
  );

  return {
    ...asyncResult,
    mutate,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: usePromise
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function usePromise<T>(promise: Promise<T> | null): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    status: promise ? 'loading' : 'idle',
    data: null,
    error: null,
    isLoading: !!promise,
    isSuccess: false,
    isError: false,
  });

  useEffect(() => {
    if (!promise) {
      setState({
        status: 'idle',
        data: null,
        error: null,
        isLoading: false,
        isSuccess: false,
        isError: false,
      });
      return;
    }

    let isCancelled = false;

    setState((prev) => ({
      ...prev,
      status: 'loading',
      isLoading: true,
      isSuccess: false,
      isError: false,
      error: null,
    }));

    promise
      .then((data) => {
        if (!isCancelled) {
          setState({
            status: 'success',
            data,
            error: null,
            isLoading: false,
            isSuccess: true,
            isError: false,
          });
        }
      })
      .catch((error) => {
        if (!isCancelled) {
          setState({
            status: 'error',
            data: null,
            error: error instanceof Error ? error : new Error(String(error)),
            isLoading: false,
            isSuccess: false,
            isError: true,
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [promise]);

  return state;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useRetry
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface UseRetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  shouldRetry?: (error: Error, attempt: number) => boolean;
}

export function useRetry<T, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>,
  options: UseRetryOptions = {},
): UseAsyncReturn<T, Args> {
  const { maxRetries = 3, retryDelay = 1000, shouldRetry } = options;

  const retryFunction = useCallback(
    async (...args: Args): Promise<T> => {
      let lastError: Error | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          return await asyncFunction(...args);
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));

          const shouldRetryThis = shouldRetry ? shouldRetry(lastError, attempt) : true;

          if (attempt >= maxRetries || !shouldRetryThis) {
            throw lastError;
          }

          await new Promise((resolve) => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }

      throw lastError;
    },
    [asyncFunction, maxRetries, retryDelay, shouldRetry],
  );

  return useAsync(retryFunction);
}
