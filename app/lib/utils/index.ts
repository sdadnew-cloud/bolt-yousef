/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: utils/index.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: ملف التصدير الرئيسي لأدوات المساعدة
 * 🔧 الغرض: توفير واجهة موحدة للوصول إلى جميع الأدوات المساعدة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 تصدير أدوات التنسيق
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export {

  // تنسيق العملة
  formatCurrency,
  formatCompactCurrency,

  // تنسيق الأرقام
  formatNumber,
  formatCompactNumber,
  formatPercentage,

  // تنسيق حجم الملفات
  formatFileSize,
  parseFileSize,

  // تنسيق التاريخ
  formatRelativeTime,
  formatShortDate,
  formatLongDate,

  // تنسيق النصوص
  truncateText,
  toTitleCase,
  toSnakeCase,
  toCamelCase,

  // تنسيق الهاتف والأرقام
  formatPhoneNumber,
  formatSerialNumber,

  // تنسيق الألوان
  hexToRgb,
  rgbToHex,

  // تنسيق البيانات المعقدة
  formatList,
  formatDuration,
} from './formatters';

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 تصدير أدوات التحقق
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export {

  // التحقق من البريد الإلكتروني
  isValidEmail,
  isValidEmailStrict,

  // التحقق من الهاتف
  isValidPhone,
  normalizePhone,

  // التحقق من URL
  isValidUrl,
  isValidUrlWithProtocol,
  isValidIP,

  // التحقق من كلمة المرور
  validatePassword,
  type PasswordValidationResult,

  // التحقق من النصوص
  isNotEmpty,
  isLengthValid,
  isArabicOnly,
  isEnglishOnly,
  isAlphanumeric,

  // التحقق من الأرقام
  isInteger,
  isDecimal,
  isInRange,

  // التحقق من التواريخ
  isValidDate,
  isFutureDate,
  isPastDate,
  isValidAge,

  // التحقق من المعرّفات
  isValidUUID,
  isValidSaudiID,

  // التحقق من البطاقات
  isValidCreditCard,
  getCreditCardType,

  // التحقق من الألوان
  isValidHexColor,
  isValidRgbColor,

  // دوال التحقق المخصصة
  createValidator,
  combineValidators,
  anyValidator,
} from './validators';

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 تصدير أدوات التخزين
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export {

  // فئة إدارة التخزين
  StorageManager,
  type StorageType,
  type StorageOptions,
  type StorageItem,

  // instance عام
  storage,

  // دوال localStorage
  setLocalStorage,
  getLocalStorage,
  removeLocalStorage,

  // دوال sessionStorage
  setSessionStorage,
  getSessionStorage,
  removeSessionStorage,

  // دوال الكوكيز
  setCookie,
  getCookie,
  removeCookie,
  getAllCookies,
  type CookieOptions,

  // IndexedDB
  IndexedDBManager,
  indexedDB,
} from './storage';

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 تصدير أدوات التاريخ والوقت
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export {

  // التحويلات
  toDate,
  isValidDate as isValidDateTime,
  now,
  today,

  // العمليات الحسابية
  add,
  subtract,
  diff,

  // المقارنات
  isBefore,
  isAfter,
  isEqual,
  isBetween,
  isToday,
  isYesterday,
  isTomorrow,

  // التنسيق
  format,
  formatRelative,

  // نطاقات التواريخ
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,

  // أدوات مساعدة
  daysInMonth,
  isLeapYear,
  getAge,
  createRange,

  // المؤقتات
  sleep,
  setTimer,
  clearTimer,

  // المناطق الزمنية
  toTimeZone,
  getLocalTimeZone,

  // الأنواع
  type DateInput,
  type DateRange,
  type TimeUnit,
} from './datetime';

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 تصدير أدوات الأمان
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export {

  // التشفير
  base64Encode,
  base64Decode,
  xorEncrypt,
  xorDecrypt,

  // توليد المفاتيح
  generateToken,
  generateUUID,
  generateSecretKey,

  // التطهير
  sanitizeHtml,
  sanitizeText,
  sanitizeInput,

  // CSRF
  generateCSRFToken,
  validateCSRFToken,

  // HMAC
  createHMAC,
  verifyHMAC,

  // Hashing
  sha256,
  sha512,

  // Rate Limiting
  checkRateLimit,

  // CSP
  generateCSP,
  defaultCSP,
  type CSPDirectives,

  // XSS
  escapeXSS,
  unescapeXSS,

  // Password
  hashPassword,
  verifyPassword,

  // Security Headers
  recommendedSecurityHeaders,
  type SecurityHeaders,

  // Encryption
  encryptData,
  decryptData,
} from './security';

/*
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 تصدير أدوات معالجة الأخطاء
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export {

  // الأنواع
  ErrorCode,
  AppError,
  type AppErrorOptions,
  type ErrorHandler,
  type ErrorHandlerResult,
  type ErrorLogEntry,

  // دوال إنشاء الأخطاء
  createError,
  createValidationError,
  createAuthError,
  createNotFoundError,
  createNetworkError,
  createTimeoutError,
  createLLMError,

  // معالجة الأخطاء
  defaultErrorHandler,
  isRecoverableError,
  withErrorHandling,
  withRetry,

  // التحقق
  isAppError,
  isValidationError,
  isAuthError,
  isNetworkError,

  // تسجيل الأخطاء
  logError,
  getErrorLog,
  clearErrorLog,
} from './errors';
