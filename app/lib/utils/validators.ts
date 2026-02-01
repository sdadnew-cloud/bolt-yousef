/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: validators.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: دوال التحقق من صحة البيانات (بريد إلكتروني، هاتف، URL، إلخ)
 * 🔧 الغرض: توفير أدوات التحقق من صحة المدخلات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📧 التحقق من البريد الإلكتروني
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * نمط التحقق من البريد الإلكتروني
 */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * التحقق من صحة البريد الإلكتروني
 * @param email - البريد الإلكتروني
 * @returns true إذا كان صحيحاً
 */
export function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email);
}

/**
 * التحقق من صحة البريد الإلكتروني مع قيود إضافية
 * @param email - البريد الإلكتروني
 * @param options - الخيارات الإضافية
 * @returns true إذا كان صحيحاً
 */
export function isValidEmailStrict(
  email: string,
  options: {
    allowedDomains?: string[];
    blockedDomains?: string[];
    maxLength?: number;
  } = {},
): boolean {
  const { allowedDomains, blockedDomains, maxLength = 254 } = options;

  if (!isValidEmail(email) || email.length > maxLength) {
    return false;
  }

  const domain = email.split('@')[1].toLowerCase();

  if (allowedDomains && !allowedDomains.includes(domain)) {
    return false;
  }

  if (blockedDomains && blockedDomains.includes(domain)) {
    return false;
  }

  return true;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📱 التحقق من رقم الهاتف
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * أنماط أرقام الهواتف حسب الدولة
 */
const PHONE_PATTERNS: Record<string, RegExp> = {
  SA: /^(\+966|0)?5[0-9]{8}$/, // السعودية
  AE: /^(\+971|0)?5[0-9]{8}$/, // الإمارات
  KW: /^(\+965)?[569][0-9]{7}$/, // الكويت
  QA: /^(\+974)?[356][0-9]{7}$/, // قطر
  BH: /^(\+973)?[36][0-9]{7}$/, // البحرين
  OM: /^(\+968)?9[0-9]{7}$/, // عمان
  EG: /^(\+20|0)?1[0-9]{9}$/, // مصر
  JO: /^(\+962|0)?7[789][0-9]{7}$/, // الأردن
  US: /^(\+1)?[2-9][0-9]{9}$/, // الولايات المتحدة
  UK: /^(\+44|0)?7[0-9]{9}$/, // المملكة المتحدة
};

/**
 * التحقق من صحة رقم الهاتف
 * @param phone - رقم الهاتف
 * @param countryCode - رمز الدولة (افتراضي: SA)
 * @returns true إذا كان صحيحاً
 */
export function isValidPhone(phone: string, countryCode: string = 'SA'): boolean {
  const pattern = PHONE_PATTERNS[countryCode];

  if (!pattern) {
    return false;
  }

  return pattern.test(phone.replace(/\s/g, ''));
}

/**
 * توحيد تنسيق رقم الهاتف
 * @param phone - رقم الهاتف
 * @param countryCode - رمز الدولة
 * @returns الرقم الموحد
 */
export function normalizePhone(phone: string, countryCode: string = 'SA'): string {
  const cleaned = phone.replace(/\D/g, '');

  const countryPrefixes: Record<string, string> = {
    SA: '966',
    AE: '971',
    KW: '965',
    QA: '974',
    BH: '973',
    OM: '968',
    EG: '20',
    JO: '962',
    US: '1',
    UK: '44',
  };

  const prefix = countryPrefixes[countryCode];

  if (!prefix) {
    return cleaned;
  }

  if (cleaned.startsWith(prefix)) {
    return `+${cleaned}`;
  }

  if (countryCode === 'SA' && cleaned.startsWith('0')) {
    return `+${prefix}${cleaned.slice(1)}`;
  }

  return `+${prefix}${cleaned}`;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌐 التحقق من URL
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من صحة URL
 * @param url - الرابط
 * @returns true إذا كان صحيحاً
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * التحقق من صحة URL مع بروتوكول محدد
 * @param url - الرابط
 * @param protocols - البروتوكولات المسموحة
 * @returns true إذا كان صحيحاً
 */
export function isValidUrlWithProtocol(url: string, protocols: string[] = ['http:', 'https:']): boolean {
  try {
    const parsed = new URL(url);
    return protocols.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * التحقق من صحة عنوان IP
 * @param ip - عنوان IP
 * @returns true إذا كان صحيحاً
 */
export function isValidIP(ip: string): boolean {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;

  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 التحقق من كلمات المرور
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * التحقق من قوة كلمة المرور
 * @param password - كلمة المرور
 * @param options - الخيارات
 * @returns نتيجة التحقق
 */
export function validatePassword(
  password: string,
  options: {
    minLength?: number;
    requireUppercase?: boolean;
    requireLowercase?: boolean;
    requireNumbers?: boolean;
    requireSpecialChars?: boolean;
  } = {},
): PasswordValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecialChars = true,
  } = options;

  const errors: string[] = [];

  if (password.length < minLength) {
    errors.push(`يجب أن تكون كلمة المرور ${minLength} أحرف على الأقل`);
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف كبير واحد على الأقل');
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    errors.push('يجب أن تحتوي على حرف صغير واحد على الأقل');
  }

  if (requireNumbers && !/[0-9]/.test(password)) {
    errors.push('يجب أن تحتوي على رقم واحد على الأقل');
  }

  if (requireSpecialChars && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('يجب أن تحتوي على رمز خاص واحد على الأقل');
  }

  // حساب قوة كلمة المرور
  let strengthScore = 0;

  if (password.length >= minLength) {
    strengthScore++;
  }

  if (/[A-Z]/.test(password)) {
    strengthScore++;
  }

  if (/[a-z]/.test(password)) {
    strengthScore++;
  }

  if (/[0-9]/.test(password)) {
    strengthScore++;
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    strengthScore++;
  }

  if (password.length >= 12) {
    strengthScore++;
  }

  let strength: 'weak' | 'medium' | 'strong' = 'weak';

  if (strengthScore >= 5) {
    strength = 'strong';
  } else if (strengthScore >= 3) {
    strength = 'medium';
  }

  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📝 التحقق من النصوص
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من أن النص غير فارغ
 * @param value - القيمة
 * @returns true إذا كان غير فارغ
 */
export function isNotEmpty(value: string | null | undefined): boolean {
  return value !== null && value !== undefined && value.trim().length > 0;
}

/**
 * التحقق من طول النص
 * @param value - النص
 * @param min - الحد الأدنى
 * @param max - الحد الأقصى
 * @returns true إذا كان الطول ضمن النطاق
 */
export function isLengthValid(value: string, min: number, max: number): boolean {
  const length = value.length;
  return length >= min && length <= max;
}

/**
 * التحقق من أن النص يحتوي على أحرف عربية فقط
 * @param value - النص
 * @returns true إذا كان صحيحاً
 */
export function isArabicOnly(value: string): boolean {
  return /^[\u0600-\u06FF\s]+$/.test(value);
}

/**
 * التحقق من أن النص يحتوي على أحرف إنجليزية فقط
 * @param value - النص
 * @returns true إذا كان صحيحاً
 */
export function isEnglishOnly(value: string): boolean {
  return /^[a-zA-Z\s]+$/.test(value);
}

/**
 * التحقق من أن النص أبجدي رقمي
 * @param value - النص
 * @returns true إذا كان صحيحاً
 */
export function isAlphanumeric(value: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(value);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔢 التحقق من الأرقام
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من أن القيمة رقم صحيح
 * @param value - القيمة
 * @returns true إذا كان رقماً صحيحاً
 */
export function isInteger(value: string): boolean {
  return /^-?\d+$/.test(value);
}

/**
 * التحقق من أن القيمة رقم عشري
 * @param value - القيمة
 * @returns true إذا كان رقماً عشرياً
 */
export function isDecimal(value: string): boolean {
  return /^-?\d*\.?\d+$/.test(value);
}

/**
 * التحقق من أن الرقم ضمن نطاق معين
 * @param value - الرقم
 * @param min - الحد الأدنى
 * @param max - الحد الأقصى
 * @returns true إذا كان ضمن النطاق
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📅 التحقق من التواريخ
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من صحة التاريخ
 * @param date - التاريخ
 * @returns true إذا كان صحيحاً
 */
export function isValidDate(date: string | Date): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

/**
 * التحقق من أن التاريخ في المستقبل
 * @param date - التاريخ
 * @returns true إذا كان في المستقبل
 */
export function isFutureDate(date: string | Date): boolean {
  const d = new Date(date);
  return d.getTime() > Date.now();
}

/**
 * التحقق من أن التاريخ في الماضي
 * @param date - التاريخ
 * @returns true إذا كان في الماضي
 */
export function isPastDate(date: string | Date): boolean {
  const d = new Date(date);
  return d.getTime() < Date.now();
}

/**
 * التحقق من عمر المستخدم
 * @param birthDate - تاريخ الميلاد
 * @param minAge - الحد الأدنى للعمر
 * @returns true إذا كان العمر مناسباً
 */
export function isValidAge(birthDate: string | Date, minAge: number = 18): boolean {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age >= minAge;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🆔 التحقق من المعرّفات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من صحة UUID
 * @param uuid - المعرف
 * @returns true إذا كان صحيحاً
 */
export function isValidUUID(uuid: string): boolean {
  const regex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return regex.test(uuid);
}

/**
 * التحقق من صحة رقم الهوية السعودية
 * @param id - رقم الهوية
 * @returns true إذا كان صحيحاً
 */
export function isValidSaudiID(id: string): boolean {
  if (!/^\d{10}$/.test(id)) {
    return false;
  }

  const digits = id.split('').map(Number);
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    if (i % 2 === 0) {
      const doubled = digits[i] * 2;
      sum += doubled > 9 ? doubled - 9 : doubled;
    } else {
      sum += digits[i];
    }
  }

  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === digits[9];
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 💳 التحقق من البطاقات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من صحة رقم بطاقة الائتمان باستخدام خوارزمية Luhn
 * @param cardNumber - رقم البطاقة
 * @returns true إذا كان صحيحاً
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

/**
 * تحديد نوع بطاقة الائتمان
 * @param cardNumber - رقم البطاقة
 * @returns نوع البطاقة
 */
export function getCreditCardType(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');

  const patterns: Record<string, RegExp> = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/,
    jcb: /^(?:2131|1800|35)/,
    diners: /^3(?:0[0-5]|[68])/,
  };

  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) {
      return type;
    }
  }

  return 'unknown';
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎨 التحقق من الألوان
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * التحقق من صحة لون HEX
 * @param color - كود اللون
 * @returns true إذا كان صحيحاً
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * التحقق من صحة لون RGB
 * @param color - كود اللون
 * @returns true إذا كان صحيحاً
 */
export function isValidRgbColor(color: string): boolean {
  return /^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/.test(color);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 دوال التحقق المخصصة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * إنشاء دالة تحقق مخصصة
 * @param validator - دالة التحقق
 * @returns دالة التحقق المخصصة
 */
export function createValidator<T>(validator: (value: T) => boolean): (value: T) => boolean {
  return validator;
}

/**
 * دمج عدة دوال تحقق
 * @param validators - دوال التحقق
 * @returns دالة تحقق موحدة
 */
export function combineValidators<T>(...validators: ((value: T) => boolean)[]): (value: T) => boolean {
  return (value: T) => validators.every((validator) => validator(value));
}

/**
 * التحقق باستخدام أي من الدوال
 * @param validators - دوال التحقق
 * @returns دالة تحقق موحدة
 */
export function anyValidator<T>(...validators: ((value: T) => boolean)[]): (value: T) => boolean {
  return (value: T) => validators.some((validator) => validator(value));
}
