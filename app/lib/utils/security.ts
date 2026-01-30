/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: security.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: أدوات الأمان والتشفير
 * 🔧 الغرض: توفير دوال للتشفير والحماية والتحقق
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔐 التشفير
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تشفير نص باستخدام Base64
 * @param text - النص المراد تشفيره
 * @returns النص المشفر
 */
export function base64Encode(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return '';
  }
}

/**
 * فك تشفير نص مشفر بـ Base64
 * @param encoded - النص المشفر
 * @returns النص الأصلي
 */
export function base64Decode(encoded: string): string {
  try {
    return decodeURIComponent(escape(atob(encoded)));
  } catch {
    return '';
  }
}

/**
 * تشفير نص باستخدام XOR
 * @param text - النص المراد تشفيره
 * @param key - المفتاح
 * @returns النص المشفر
 */
export function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return base64Encode(result);
}

/**
 * فك تشفير نص مشفر بـ XOR
 * @param encoded - النص المشفر
 * @param key - المفتاح
 * @returns النص الأصلي
 */
export function xorDecrypt(encoded: string, key: string): string {
  const decoded = base64Decode(encoded);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔑 توليد المفاتيح والرموز
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * توليد رمز عشوائي
 * @param length - طول الرمز
 * @returns الرمز العشوائي
 */
export function generateToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

/**
 * توليد UUID v4
 * @returns UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * توليد مفتاح سري
 * @param length - طول المفتاح
 * @returns المفتاح السري
 */
export function generateSecretKey(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }

  return result;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ التطهير والتنظيف
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تطهير نص HTML
 * @param html - النص HTML
 * @returns النص النظيف
 */
export function sanitizeHtml(html: string): string {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * تطهير نص من الأحرف الخاصة
 * @param text - النص
 * @returns النص المطهر
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
}

/**
 * تطهير إدخال المستخدم
 * @param input - الإدخال
 * @returns الإدخال المطهر
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '')
    .replace(/['"]/g, '')
    .replace(/;/g, '');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 CSRF Protection
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * توليد رمز CSRF
 * @returns رمز CSRF
 */
export function generateCSRFToken(): string {
  return generateToken(32);
}

/**
 * التحقق من رمز CSRF
 * @param token - الرمز المراد التحقق منه
 * @param storedToken - الرمز المخزن
 * @returns true إذا كان صحيحاً
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  return token === storedToken;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📝 التوقيعات الرقمية (HMAC)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * إنشاء توقيع HMAC
 * @param message - الرسالة
 * @param secret - المفتاح السري
 * @returns التوقيع
 */
export async function createHMAC(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * التحقق من توقيع HMAC
 * @param message - الرسالة
 * @param signature - التوقيع
 * @param secret - المفتاح السري
 * @returns true إذا كان صحيحاً
 */
export async function verifyHMAC(message: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await createHMAC(message, secret);
  return signature === expectedSignature;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔐 Hashing
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * إنشاء hash باستخدام SHA-256
 * @param message - الرسالة
 * @returns الـ hash
 */
export async function sha256(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * إنشاء hash باستخدام SHA-512
 * @param message - الرسالة
 * @returns الـ hash
 */
export async function sha512(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ Rate Limiting
 * ═══════════════════════════════════════════════════════════════════════════════
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * التحقق من تجاوز الحد
 * @param key - المفتاح (عادةً IP أو معرف المستخدم)
 * @param maxRequests - الحد الأقصى للطلبات
 * @param windowMs - النافذة الزمنية بالمللي ثانية
 * @returns نتيجة التحقق
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { allowed: true, remaining: maxRequests - 1, resetTime: now + windowMs };
  }

  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count, resetTime: entry.resetTime };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 Content Security Policy
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface CSPDirectives {
  'default-src'?: string[];
  'script-src'?: string[];
  'style-src'?: string[];
  'img-src'?: string[];
  'font-src'?: string[];
  'connect-src'?: string[];
  'media-src'?: string[];
  'object-src'?: string[];
  'frame-src'?: string[];
  'worker-src'?: string[];
  'manifest-src'?: string[];
  'base-uri'?: string[];
  'form-action'?: string[];
}

/**
 * إنشاء ترويسة CSP
 * @param directives - التوجيهات
 * @returns قيمة ترويسة CSP
 */
export function generateCSP(directives: CSPDirectives): string {
  const parts: string[] = [];

  for (const [key, values] of Object.entries(directives)) {
    if (values && values.length > 0) {
      parts.push(`${key} ${values.join(' ')}`);
    }
  }

  return parts.join('; ');
}

/**
 * CSP افتراضي آمن
 */
export const defaultCSP: CSPDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https:'],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'frame-src': ["'self'"],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ XSS Protection
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تطهير نص من هجمات XSS
 * @param text - النص
 * @returns النص المطهر
 */
export function escapeXSS(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * فك تطهير نص
 * @param html - النص HTML
 * @returns النص الأصلي
 */
export function unescapeXSS(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || '';
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔐 Password Hashing (Simple)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تجزئة كلمة المرور (بسيطة - للاستخدام المحلي فقط)
 * @param password - كلمة المرور
 * @param salt - الملح
 * @returns كلمة المرور المجزأة
 */
export async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
  const usedSalt = salt || generateToken(16);
  const combined = password + usedSalt;
  const hash = await sha256(combined);
  return { hash, salt: usedSalt };
}

/**
 * التحقق من كلمة المرور
 * @param password - كلمة المرور
 * @param hash - الـ hash المخزن
 * @param salt - الملح
 * @returns true إذا كانت صحيحة
 */
export async function verifyPassword(password: string, hash: string, salt: string): Promise<boolean> {
  const result = await hashPassword(password, salt);
  return result.hash === hash;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🛡️ Secure Headers
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface SecurityHeaders {
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
}

/**
 * ترويسات الأمان الموصى بها
 */
export const recommendedSecurityHeaders: SecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔒 Encryption at Rest (Simple)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تشفير بيانات باستخدام Web Crypto API
 * @param data - البيانات
 * @param password - كلمة المرور
 * @returns البيانات المشفرة
 */
export async function encryptData(data: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  // توليد مفتاح من كلمة المرور
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoder.encode(data)
  );

  // دمج الملح + IV + البيانات المشفرة
  const result = new Uint8Array(salt.length + iv.length + encrypted.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(encrypted), salt.length + iv.length);

  return base64Encode(decoder.decode(result));
}

/**
 * فك تشفير بيانات
 * @param encryptedData - البيانات المشفرة
 * @param password - كلمة المرور
 * @returns البيانات الأصلية
 */
export async function decryptData(encryptedData: string, password: string): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const data = new Uint8Array(
    Array.from(base64Decode(encryptedData)).map((c) => c.charCodeAt(0))
  );

  const salt = data.slice(0, 16);
  const iv = data.slice(16, 28);
  const encrypted = data.slice(28);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encrypted
  );

  return decoder.decode(decrypted);
}
