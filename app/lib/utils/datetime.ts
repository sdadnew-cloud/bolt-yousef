/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: datetime.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: دوال التاريخ والوقت المتقدمة
 * 🔧 الغرض: توفير أدوات للتعامل مع التواريخ والأوقات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📅 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type DateInput = Date | string | number;

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeUnit {
  years?: number;
  months?: number;
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
  milliseconds?: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔄 التحويلات الأساسية
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تحويل المدخل إلى كائن Date
 * @param input - المدخل (Date أو string أو number)
 * @returns كائن Date
 */
export function toDate(input: DateInput): Date {
  if (input instanceof Date) {
    return input;
  }

  return new Date(input);
}

/**
 * التحقق من صحة التاريخ
 * @param input - المدخل
 * @returns true إذا كان تاريخاً صحيحاً
 */
export function isValidDate(input: DateInput): boolean {
  const date = toDate(input);
  return !isNaN(date.getTime());
}

/**
 * الحصول على الطابع الزمني الحالي
 * @returns الطابع الزمني بالمللي ثانية
 */
export function now(): number {
  return Date.now();
}

/**
 * الحصول على تاريخ اليوم (بدون وقت)
 * @returns تاريخ اليوم
 */
export function today(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);

  return date;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ➕➖ العمليات الحسابية على التواريخ
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * إضافة وقت إلى تاريخ
 * @param date - التاريخ
 * @param unit - الوحدة والقيمة
 * @returns التاريخ الجديد
 */
export function add(date: DateInput, unit: TimeUnit): Date {
  const result = toDate(date);

  if (unit.years) {
    result.setFullYear(result.getFullYear() + unit.years);
  }

  if (unit.months) {
    result.setMonth(result.getMonth() + unit.months);
  }

  if (unit.days) {
    result.setDate(result.getDate() + unit.days);
  }

  if (unit.hours) {
    result.setHours(result.getHours() + unit.hours);
  }

  if (unit.minutes) {
    result.setMinutes(result.getMinutes() + unit.minutes);
  }

  if (unit.seconds) {
    result.setSeconds(result.getSeconds() + unit.seconds);
  }

  if (unit.milliseconds) {
    result.setMilliseconds(result.getMilliseconds() + unit.milliseconds);
  }

  return result;
}

/**
 * طرح وقت من تاريخ
 * @param date - التاريخ
 * @param unit - الوحدة والقيمة
 * @returns التاريخ الجديد
 */
export function subtract(date: DateInput, unit: TimeUnit): Date {
  const negativeUnit: TimeUnit = {};

  for (const [key, value] of Object.entries(unit)) {
    if (value !== undefined) {
      (negativeUnit as Record<string, number>)[key] = -value;
    }
  }

  return add(date, negativeUnit);
}

/**
 * الفرق بين تاريخين
 * @param date1 - التاريخ الأول
 * @param date2 - التاريخ الثاني
 * @param unit - وحدة الفرق (افتراضي: milliseconds)
 * @returns قيمة الفرق
 */
export function diff(date1: DateInput, date2: DateInput, unit: keyof TimeUnit = 'milliseconds'): number {
  const d1 = toDate(date1).getTime();
  const d2 = toDate(date2).getTime();
  const diffMs = d1 - d2;

  const divisors: Record<string, number> = {
    milliseconds: 1,
    seconds: 1000,
    minutes: 1000 * 60,
    hours: 1000 * 60 * 60,
    days: 1000 * 60 * 60 * 24,
    months: 1000 * 60 * 60 * 24 * 30.44,
    years: 1000 * 60 * 60 * 24 * 365.25,
  };

  return Math.floor(diffMs / (divisors[unit] || 1));
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔄 المقارنات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق إذا كان التاريخ الأول قبل الثاني
 * @param date1 - التاريخ الأول
 * @param date2 - التاريخ الثاني
 * @returns true إذا كان date1 قبل date2
 */
export function isBefore(date1: DateInput, date2: DateInput): boolean {
  return toDate(date1).getTime() < toDate(date2).getTime();
}

/**
 * التحقق إذا كان التاريخ الأول بعد الثاني
 * @param date1 - التاريخ الأول
 * @param date2 - التاريخ الثاني
 * @returns true إذا كان date1 بعد date2
 */
export function isAfter(date1: DateInput, date2: DateInput): boolean {
  return toDate(date1).getTime() > toDate(date2).getTime();
}

/**
 * التحقق إذا كان التاريخ الأول يساوي الثاني
 * @param date1 - التاريخ الأول
 * @param date2 - التاريخ الثاني
 * @returns true إذا كانا متساويين
 */
export function isEqual(date1: DateInput, date2: DateInput): boolean {
  return toDate(date1).getTime() === toDate(date2).getTime();
}

/**
 * التحقق إذا كان التاريخ بين تاريخين
 * @param date - التاريخ
 * @param start - بداية النطاق
 * @param end - نهاية النطاق
 * @returns true إذا كان ضمن النطاق
 */
export function isBetween(date: DateInput, start: DateInput, end: DateInput): boolean {
  const d = toDate(date).getTime();
  return d >= toDate(start).getTime() && d <= toDate(end).getTime();
}

/**
 * التحقق إذا كان التاريخ اليوم
 * @param date - التاريخ
 * @returns true إذا كان اليوم
 */
export function isToday(date: DateInput): boolean {
  const d = toDate(date);
  const t = today();

  return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
}

/**
 * التحقق إذا كان التاريخ أمس
 * @param date - التاريخ
 * @returns true إذا كان أمس
 */
export function isYesterday(date: DateInput): boolean {
  const yesterday = add(today(), { days: -1 });
  const d = toDate(date);

  return (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  );
}

/**
 * التحقق إذا كان التاريخ غداً
 * @param date - التاريخ
 * @returns true إذا كان غداً
 */
export function isTomorrow(date: DateInput): boolean {
  const tomorrow = add(today(), { days: 1 });
  const d = toDate(date);

  return (
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate()
  );
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 التنسيق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تنسيق التاريخ
 * @param date - التاريخ
 * @param format - نمط التنسيق
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق
 */
export function format(date: DateInput, format: string = 'YYYY-MM-DD', locale: string = 'ar-SA'): string {
  const d = toDate(date);

  const tokens: Record<string, string> = {
    YYYY: d.getFullYear().toString(),
    YY: d.getFullYear().toString().slice(-2),
    MM: String(d.getMonth() + 1).padStart(2, '0'),
    M: String(d.getMonth() + 1),
    DD: String(d.getDate()).padStart(2, '0'),
    D: String(d.getDate()),
    HH: String(d.getHours()).padStart(2, '0'),
    H: String(d.getHours()),
    hh: String(d.getHours() % 12 || 12).padStart(2, '0'),
    h: String(d.getHours() % 12 || 12),
    mm: String(d.getMinutes()).padStart(2, '0'),
    m: String(d.getMinutes()),
    ss: String(d.getSeconds()).padStart(2, '0'),
    s: String(d.getSeconds()),
    A: d.getHours() >= 12 ? 'PM' : 'AM',
    a: d.getHours() >= 12 ? 'pm' : 'am',
  };

  return format.replace(/YYYY|YY|MM|M|DD|D|HH|H|hh|h|mm|m|ss|s|A|a/g, (match) => tokens[match] || match);
}

/**
 * تنسيق التاريخ النسبي
 * @param date - التاريخ
 * @param locale - اللغة والمنطقة
 * @returns النص المنسق
 */
export function formatRelative(date: DateInput, locale: string = 'ar-SA'): string {
  const d = toDate(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

  if (diffSec < 60) {
    return rtf.format(-diffSec, 'second');
  }

  if (diffMin < 60) {
    return rtf.format(-diffMin, 'minute');
  }

  if (diffHour < 24) {
    return rtf.format(-diffHour, 'hour');
  }

  if (diffDay < 30) {
    return rtf.format(-diffDay, 'day');
  }

  if (diffDay < 365) {
    return rtf.format(-Math.floor(diffDay / 30), 'month');
  }

  return rtf.format(-Math.floor(diffDay / 365), 'year');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📊 نطاقات التواريخ
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * الحصول على بداية اليوم
 * @param date - التاريخ
 * @returns بداية اليوم
 */
export function startOfDay(date: DateInput): Date {
  const d = toDate(date);
  d.setHours(0, 0, 0, 0);

  return d;
}

/**
 * الحصول على نهاية اليوم
 * @param date - التاريخ
 * @returns نهاية اليوم
 */
export function endOfDay(date: DateInput): Date {
  const d = toDate(date);
  d.setHours(23, 59, 59, 999);

  return d;
}

/**
 * الحصول على بداية الأسبوع
 * @param date - التاريخ
 * @returns بداية الأسبوع
 */
export function startOfWeek(date: DateInput): Date {
  const d = toDate(date);
  const day = d.getDay();
  const diff = d.getDate() - day;

  return startOfDay(new Date(d.setDate(diff)));
}

/**
 * الحصول على نهاية الأسبوع
 * @param date - التاريخ
 * @returns نهاية الأسبوع
 */
export function endOfWeek(date: DateInput): Date {
  const d = toDate(date);
  const day = d.getDay();
  const diff = d.getDate() + (6 - day);

  return endOfDay(new Date(d.setDate(diff)));
}

/**
 * الحصول على بداية الشهر
 * @param date - التاريخ
 * @returns بداية الشهر
 */
export function startOfMonth(date: DateInput): Date {
  const d = toDate(date);
  d.setDate(1);

  return startOfDay(d);
}

/**
 * الحصول على نهاية الشهر
 * @param date - التاريخ
 * @returns نهاية الشهر
 */
export function endOfMonth(date: DateInput): Date {
  const d = toDate(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);

  return endOfDay(d);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛠️ أدوات مساعدة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * الحصول على عدد الأيام في الشهر
 * @param year - السنة
 * @param month - الشهر (0-11)
 * @returns عدد الأيام
 */
export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * التحقق من السنة الكبيسة
 * @param year - السنة
 * @returns true إذا كانت كبيسة
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * الحصول على عمر بالسنوات
 * @param birthDate - تاريخ الميلاد
 * @returns العمر
 */
export function getAge(birthDate: DateInput): number {
  const birth = toDate(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * إنشاء نطاق تواريخ
 * @param start - بداية النطاق
 * @param end - نهاية النطاق
 * @returns مصفوفة من التواريخ
 */
export function createRange(start: DateInput, end: DateInput): Date[] {
  const dates: Date[] = [];
  let current = toDate(start);
  const endDate = toDate(end);

  while (current <= endDate) {
    dates.push(new Date(current));
    current = add(current, { days: 1 });
  }

  return dates;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ⏱️ المؤقتات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تأخير التنفيذ
 * @param ms - المدة بالمللي ثانية
 * @returns وعد
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * إنشاء مؤقت
 * @param callback - الدالة المراد تنفيذها
 * @param delay - التأخير بالمللي ثانية
 * @returns معرف المؤقت
 */
export function setTimer(callback: () => void, delay: number): number {
  return window.setTimeout(callback, delay);
}

/**
 * إلغاء المؤقت
 * @param id - معرف المؤقت
 */
export function clearTimer(id: number): void {
  clearTimeout(id);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 المناطق الزمنية
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تحويل التاريخ إلى منطقة زمنية مختلفة
 * @param date - التاريخ
 * @param timeZone - المنطقة الزمنية
 * @returns التاريخ المحول
 */
export function toTimeZone(date: DateInput, timeZone: string): Date {
  const d = toDate(date);
  const options: Intl.DateTimeFormatOptions = {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(d);

  const dateParts: Record<string, string> = {};
  parts.forEach((part) => {
    dateParts[part.type] = part.value;
  });

  return new Date(
    `${dateParts.year}-${dateParts.month}-${dateParts.day}T${dateParts.hour}:${dateParts.minute}:${dateParts.second}`,
  );
}

/**
 * الحصول على المنطقة الزمنية المحلية
 * @returns اسم المنطقة الزمنية
 */
export function getLocalTimeZone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
