/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: errors.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: معالجة الأخطاء المخصصة
 * 🔧 الغرض: توفير نظام شامل لإدارة الأخطاء والاستثناءات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع الأخطاء
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export enum ErrorCode {
  // أخطاء عامة
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',

  // أخطاء الشبكة
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // أخطاء HTTP
  BAD_REQUEST = 'BAD_REQUEST',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  UNPROCESSABLE_ENTITY = 'UNPROCESSABLE_ENTITY',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  SERVER_ERROR = 'SERVER_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',

  // أخطاء التحقق
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_FIELD = 'MISSING_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',

  // أخطاء المصادقة
  AUTH_ERROR = 'AUTH_ERROR',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // أخطاء الموارد
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RESOURCE_LIMIT_EXCEEDED = 'RESOURCE_LIMIT_EXCEEDED',

  // أخطاء الملفات
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_UPLOAD_ERROR = 'FILE_UPLOAD_ERROR',

  // أخطاء قاعدة البيانات
  DATABASE_ERROR = 'DATABASE_ERROR',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  FOREIGN_KEY_ERROR = 'FOREIGN_KEY_ERROR',

  // أخطاء LLM
  LLM_ERROR = 'LLM_ERROR',
  LLM_RATE_LIMIT = 'LLM_RATE_LIMIT',
  LLM_CONTEXT_LENGTH = 'LLM_CONTEXT_LENGTH',
  LLM_INVALID_RESPONSE = 'LLM_INVALID_RESPONSE',
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏗️ فئة الخطأ المخصصة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface AppErrorOptions {
  code: ErrorCode;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  cause?: Error;
  recoverable?: boolean;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details: Record<string, unknown>;
  public readonly cause?: Error;
  public readonly recoverable: boolean;
  public readonly timestamp: Date;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = 'AppError';
    this.code = options.code;
    this.statusCode = options.statusCode || getStatusCodeForError(options.code);
    this.details = options.details || {};
    this.cause = options.cause;
    this.recoverable = options.recoverable ?? isRecoverableError(options.code);
    this.timestamp = new Date();

    // الحفاظ على stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * تحويل الخطأ إلى كائن JSON
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      recoverable: this.recoverable,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause?.message,
    };
  }

  /**
   * الحصول على رسالة مناسبة للمستخدم
   */
  getUserMessage(): string {
    return getUserFriendlyMessage(this.code, this.message);
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏭 دوال إنشاء الأخطاء
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function createError(
  code: ErrorCode,
  message: string,
  options?: Partial<Omit<AppErrorOptions, 'code' | 'message'>>
): AppError {
  return new AppError({
    code,
    message,
    ...options,
  });
}

export function createValidationError(
  message: string,
  details?: Record<string, unknown>
): AppError {
  return createError(ErrorCode.VALIDATION_ERROR, message, { details });
}

export function createAuthError(
  message: string = 'غير مصرح',
  code: ErrorCode = ErrorCode.UNAUTHORIZED
): AppError {
  return createError(code, message);
}

export function createNotFoundError(
  resource: string,
  identifier?: string
): AppError {
  const message = identifier
    ? `${resource} غير موجود: ${identifier}`
    : `${resource} غير موجود`;
  return createError(ErrorCode.NOT_FOUND, message);
}

export function createNetworkError(
  message: string = 'خطأ في الاتصال بالشبكة',
  cause?: Error
): AppError {
  return createError(ErrorCode.NETWORK_ERROR, message, {
    cause,
    recoverable: true,
  });
}

export function createTimeoutError(
  operation: string,
  timeoutMs: number
): AppError {
  return createError(
    ErrorCode.TIMEOUT_ERROR,
    `انتهت مهلة العملية: ${operation} (${timeoutMs}ms)`,
    { recoverable: true }
  );
}

export function createLLMError(
  message: string,
  code: ErrorCode = ErrorCode.LLM_ERROR,
  details?: Record<string, unknown>
): AppError {
  return createError(code, message, { details, recoverable: true });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔄 معالجة الأخطاء
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface ErrorHandlerResult {
  success: boolean;
  error?: AppError;
  retry?: boolean;
  retryDelay?: number;
}

export type ErrorHandler = (error: unknown) => ErrorHandlerResult;

/**
 * معالج الأخطاء الافتراضي
 */
export const defaultErrorHandler: ErrorHandler = (error) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error,
      retry: error.recoverable,
      retryDelay: error.recoverable ? 1000 : undefined,
    };
  }

  if (error instanceof Error) {
    const appError = createError(ErrorCode.UNKNOWN_ERROR, error.message, {
      cause: error,
    });
    return {
      success: false,
      error: appError,
      retry: false,
    };
  }

  const appError = createError(
    ErrorCode.UNKNOWN_ERROR,
    'حدث خطأ غير معروف'
  );
  return {
    success: false,
    error: appError,
    retry: false,
  };
};

/**
 * التحقق مما إذا كان الخطأ قابلاً للاسترداد
 */
export function isRecoverableError(code: ErrorCode): boolean {
  const recoverableCodes: ErrorCode[] = [
    ErrorCode.NETWORK_ERROR,
    ErrorCode.TIMEOUT_ERROR,
    ErrorCode.CONNECTION_ERROR,
    ErrorCode.TOO_MANY_REQUESTS,
    ErrorCode.SERVICE_UNAVAILABLE,
    ErrorCode.LLM_RATE_LIMIT,
    ErrorCode.LLM_CONTEXT_LENGTH,
    ErrorCode.TOKEN_EXPIRED,
  ];
  return recoverableCodes.includes(code);
}

/**
 * الحصول على رمز الحالة HTTP
 */
function getStatusCodeForError(code: ErrorCode): number {
  const statusCodes: Record<ErrorCode, number> = {
    [ErrorCode.BAD_REQUEST]: 400,
    [ErrorCode.UNAUTHORIZED]: 401,
    [ErrorCode.FORBIDDEN]: 403,
    [ErrorCode.NOT_FOUND]: 404,
    [ErrorCode.CONFLICT]: 409,
    [ErrorCode.UNPROCESSABLE_ENTITY]: 422,
    [ErrorCode.TOO_MANY_REQUESTS]: 429,
    [ErrorCode.SERVER_ERROR]: 500,
    [ErrorCode.SERVICE_UNAVAILABLE]: 503,
  };
  return statusCodes[code] || 500;
}

/**
 * الحصول على رسالة مناسبة للمستخدم
 */
function getUserFriendlyMessage(code: ErrorCode, defaultMessage: string): string {
  const messages: Record<ErrorCode, string> = {
    [ErrorCode.VALIDATION_ERROR]: 'المدخلات غير صحيحة، يرجى التحقق والمحاولة مرة أخرى',
    [ErrorCode.UNAUTHORIZED]: 'يجب تسجيل الدخول للوصول إلى هذا المحتوى',
    [ErrorCode.FORBIDDEN]: 'ليس لديك صلاحية الوصول إلى هذا المحتوى',
    [ErrorCode.NOT_FOUND]: 'المحتوى المطلوب غير موجود',
    [ErrorCode.NETWORK_ERROR]: 'خطأ في الاتصال، يرجى التحقق من اتصالك بالإنترنت',
    [ErrorCode.TIMEOUT_ERROR]: 'استغرقت العملية وقتاً طويلاً، يرجى المحاولة مرة أخرى',
    [ErrorCode.SERVER_ERROR]: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً',
    [ErrorCode.LLM_ERROR]: 'خطأ في معالجة الطلب، يرجى المحاولة مرة أخرى',
    [ErrorCode.LLM_RATE_LIMIT]: 'تم تجاوز الحد المسموح، يرجى الانتظار قليلاً',
    [ErrorCode.FILE_TOO_LARGE]: 'الملف كبير جداً، يرجى اختيار ملف أصغر',
    [ErrorCode.INVALID_FILE_TYPE]: 'نوع الملف غير مدعوم',
  };
  return messages[code] || defaultMessage;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ أدوات مساعدة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التفاف دالة في معالج أخطاء
 */
export function withErrorHandling<T extends (...args: unknown[]) => unknown>(
  fn: T,
  handler: ErrorHandler = defaultErrorHandler
): (...args: Parameters<T>) => ReturnType<T> | ErrorHandlerResult {
  return (...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => handler(error)) as ReturnType<T>;
      }
      return result;
    } catch (error) {
      return handler(error);
    }
  };
}

/**
 * تنفيذ دالة مع إعادة المحاولة
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    delay?: number;
    backoff?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    shouldRetry = (error) =>
      error instanceof AppError ? error.recoverable : false,
  } = options;

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const waitTime = delay * Math.pow(backoff, attempt);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}

/**
 * التحقق من نوع الخطأ
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

export function isValidationError(error: unknown): boolean {
  return isAppError(error) && error.code === ErrorCode.VALIDATION_ERROR;
}

export function isAuthError(error: unknown): boolean {
  return (
    isAppError(error) &&
    (error.code === ErrorCode.UNAUTHORIZED || error.code === ErrorCode.FORBIDDEN)
  );
}

export function isNetworkError(error: unknown): boolean {
  return (
    isAppError(error) &&
    (error.code === ErrorCode.NETWORK_ERROR ||
      error.code === ErrorCode.TIMEOUT_ERROR ||
      error.code === ErrorCode.CONNECTION_ERROR)
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📊 تسجيل الأخطاء
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface ErrorLogEntry {
  code: ErrorCode;
  message: string;
  stack?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

const errorLog: ErrorLogEntry[] = [];
const MAX_ERROR_LOG_SIZE = 100;

/**
 * تسجيل خطأ
 */
export function logError(error: unknown, context?: Record<string, unknown>): void {
  const entry: ErrorLogEntry = {
    code: isAppError(error) ? error.code : ErrorCode.UNKNOWN_ERROR,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    timestamp: new Date(),
    context,
  };

  errorLog.unshift(entry);

  // الاحتفاظ فقط بآخر 100 خطأ
  if (errorLog.length > MAX_ERROR_LOG_SIZE) {
    errorLog.pop();
  }

  // يمكن إرسال الخطأ إلى خدمة تتبع الأخطاء هنا
  console.error('[Error]', entry);
}

/**
 * الحصول على سجل الأخطاء
 */
export function getErrorLog(): ErrorLogEntry[] {
  return [...errorLog];
}

/**
 * مسح سجل الأخطاء
 */
export function clearErrorLog(): void {
  errorLog.length = 0;
}
