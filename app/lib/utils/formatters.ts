/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: formatters.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: دوال تنسيق البيانات المختلفة (عملة، نسبة مئوية، حجم ملف، إلخ)
 * 🔧 الغرض: توفير أدوات مساعدة لتنسيق البيانات بشكل موحد
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💰 دوال تنسيق العملة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تنسيق رقم كعملة
 * @param value - القيمة الرقمية
 * @param currency - رمز العملة (افتراضي: USD)
 * @param locale - اللغة والمنطقة (افتراضي: ar-SA)
 * @returns النص المنسق للعملة
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'ar-SA'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * تنسيق رقم كعملة مضغوط (K, M, B)
 * @param value - القيمة الرقمية
 * @param currency - رمز العملة (افتراضي: USD)
 * @returns النص المنسق المضغوط
 */
export function formatCompactCurrency(value: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    notation: 'compact',
  });
  return formatter.format(value);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📊 دوال تنسيق الأرقام والنسب
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تنسيق رقم بفواصل آلاف
 * @param value - القيمة الرقمية
 * @param decimals - عدد المنازل العشرية
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق
 */
export function formatNumber(
  value: number,
  decimals: number = 0,
  locale: string = 'ar-SA'
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * تنسيق رقم مضغوط (K, M, B, T)
 * @param value - القيمة الرقمية
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق المضغوط
 */
export function formatCompactNumber(value: number, locale: string = 'ar-SA'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
  }).format(value);
}

/**
 * تنسيق نسبة مئوية
 * @param value - القيمة العشرية (0.5 = 50%)
 * @param decimals - عدد المنازل العشرية
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق للنسبة المئوية
 */
export function formatPercentage(
  value: number,
  decimals: number = 0,
  locale: string = 'ar-SA'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💾 دوال تنسيق حجم الملفات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const SIZE_UNITS = ['بايت', 'كيلوبايت', 'ميغابايت', 'جيغابايت', 'تيرابايت', 'بيتابايت'];

/**
 * تنسيق حجم الملف إلى وحدة مقروءة
 * @param bytes - الحجم بالبايت
 * @param decimals - عدد المنازل العشرية
 * @returns النص المنسق للحجم
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 بايت';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${SIZE_UNITS[i]}`;
}

/**
 * تحويل حجم الملف إلى بايت
 * @param size - الحجم مع الوحدة (مثال: "10MB", "1.5 GB")
 * @returns الحجم بالبايت
 */
export function parseFileSize(size: string): number {
  const units: Record<string, number> = {
    B: 1,
    KB: 1024,
    MB: 1024 ** 2,
    GB: 1024 ** 3,
    TB: 1024 ** 4,
    PB: 1024 ** 5,
  };

  const match = size.match(/^([\d.]+)\s*(B|KB|MB|GB|TB|PB)$/i);
  if (!match) return 0;

  const [, value, unit] = match;
  return parseFloat(value) * (units[unit.toUpperCase()] || 1);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📅 دوال تنسيق التاريخ والوقت
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تنسيق تاريخ نسبي (منذ...)
 * @param date - التاريخ
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق للتاريخ النسبي
 */
export function formatRelativeTime(
  date: Date | string | number,
  locale: string = 'ar-SA'
): string {
  const now = new Date();
  const targetDate = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - targetDate.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }
  if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  }
  if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  }
  if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }
  if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  }
  return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
}

/**
 * تنسيق تاريخ قصير
 * @param date - التاريخ
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق للتاريخ
 */
export function formatShortDate(
  date: Date | string | number,
  locale: string = 'ar-SA'
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
}

/**
 * تنسيق تاريخ طويل
 * @param date - التاريخ
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق للتاريخ
 */
export function formatLongDate(
  date: Date | string | number,
  locale: string = 'ar-SA'
): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date(date));
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📝 دوال تنسيق النصوص
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تقصير النص إلى طول محدد
 * @param text - النص الأصلي
 * @param maxLength - الحد الأقصى للطول
 * @param suffix - اللاحقة (افتراضي: ...)
 * @returns النص المقصر
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * تحويل النص إلى حالة العنوان (Title Case)
 * @param text - النص الأصلي
 * @returns النص المحول
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * تحويل النص إلى snake_case
 * @param text - النص الأصلي
 * @returns النص المحول
 */
export function toSnakeCase(text: string): string {
  return text
    .replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
    .replace(/^_/, '')
    .replace(/\s+/g, '_')
    .toLowerCase();
}

/**
 * تحويل النص إلى camelCase
 * @param text - النص الأصلي
 * @returns النص المحول
 */
export function toCamelCase(text: string): string {
  return text
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔢 دوال تنسيق الأرقام المتخصصة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تنسيق رقم الهاتف
 * @param phone - رقم الهاتف
 * @param countryCode - رمز الدولة
 * @returns رقم الهاتف المنسق
 */
export function formatPhoneNumber(phone: string, countryCode: string = 'SA'): string {
  const cleaned = phone.replace(/\D/g, '');

  if (countryCode === 'SA' && cleaned.length === 12 && cleaned.startsWith('966')) {
    return `+966 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  if (countryCode === 'SA' && cleaned.length === 10 && cleaned.startsWith('05')) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }

  return phone;
}

/**
 * تنسيق الرقم التسلسلي
 * @param num - الرقم
 * @param length - الطول المطلوب
 * @returns الرقم المنسق مع أصفار بادئة
 */
export function formatSerialNumber(num: number, length: number = 6): string {
  return num.toString().padStart(length, '0');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 دوال تنسيق الألوان
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تحويل لون HEX إلى RGB
 * @param hex - كود اللون HEX
 * @returns كائن RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * تحويل RGB إلى لون HEX
 * @param r - الأحمر
 * @param g - الأخضر
 * @param b - الأزرق
 * @returns كود اللون HEX
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📊 دوال تنسيق البيانات المعقدة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تنسيق قائمة بفواصل و "و" قبل العنصر الأخير
 * @param items - العناصر
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق
 */
export function formatList(items: string[], locale: string = 'ar-SA'): string {
  return new Intl.ListFormat(locale, { style: 'long', type: 'conjunction' }).format(items);
}

/**
 * تنسيق مدة زمنية
 * @param milliseconds - المدة بالمللي ثانية
 * @returns النص المنسق للمدة
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} يوم ${hours % 24} ساعة`;
  if (hours > 0) return `${hours} ساعة ${minutes % 60} دقيقة`;
  if (minutes > 0) return `${minutes} دقيقة ${seconds % 60} ثانية`;
  return `${seconds} ثانية`;
}
