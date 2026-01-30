/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: storage.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: إدارة التخزين المحلي مع دعم التسميات والتشفير
 * 🔧 الغرض: توفير واجهة موحدة للتعامل مع localStorage و sessionStorage
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🏷️ أنواع البيانات والتسميات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type StorageType = 'local' | 'session';

export interface StorageOptions {
  type?: StorageType;
  expires?: number; // بالمللي ثانية
  encrypt?: boolean;
  prefix?: string;
}

export interface StorageItem<T> {
  value: T;
  expires?: number;
  createdAt: number;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🔐 التشفير البسيط (Base64)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * تشفير النص باستخدام Base64
 * @param text - النص المراد تشفيره
 * @returns النص المشفر
 */
function encrypt(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return text;
  }
}

/**
 * فك تشفير النص
 * @param text - النص المشفر
 * @returns النص الأصلي
 */
function decrypt(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    return text;
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🗄️ فئة إدارة التخزين
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export class StorageManager {
  private prefix: string;

  constructor(prefix: string = 'bolt_app_') {
    this.prefix = prefix;
  }

  /**
   * الحصول على كائن التخزين المناسب
   * @param type - نوع التخزين
   * @returns كائن التخزين
   */
  private getStorage(type: StorageType = 'local'): Storage {
    return type === 'local' ? localStorage : sessionStorage;
  }

  /**
   * إنشاء مفتاح مع التسمية
   * @param key - المفتاح الأصلي
   * @returns المفتاح مع التسمية
   */
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  /**
   * حفظ عنصر في التخزين
   * @param key - المفتاح
   * @param value - القيمة
   * @param options - الخيارات
   */
  set<T>(key: string, value: T, options: StorageOptions = {}): void {
    const { type = 'local', expires, encrypt = false } = options;

    const item: StorageItem<T> = {
      value,
      createdAt: Date.now(),
      ...(expires && { expires: Date.now() + expires }),
    };

    let serialized = JSON.stringify(item);

    if (encrypt) {
      serialized = encrypt(serialized);
    }

    try {
      this.getStorage(type).setItem(this.getKey(key), serialized);
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }

  /**
   * استرجاع عنصر من التخزين
   * @param key - المفتاح
   * @param options - الخيارات
   * @returns القيمة أو null
   */
  get<T>(key: string, options: StorageOptions = {}): T | null {
    const { type = 'local', encrypt = false } = options;

    try {
      const stored = this.getStorage(type).getItem(this.getKey(key));

      if (!stored) return null;

      let serialized = stored;
      if (encrypt) {
        serialized = decrypt(stored);
      }

      const item: StorageItem<T> = JSON.parse(serialized);

      // التحقق من انتهاء الصلاحية
      if (item.expires && Date.now() > item.expires) {
        this.remove(key, options);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error('Error reading from storage:', error);
      return null;
    }
  }

  /**
   * إزالة عنصر من التخزين
   * @param key - المفتاح
   * @param options - الخيارات
   */
  remove(key: string, options: StorageOptions = {}): void {
    const { type = 'local' } = options;

    try {
      this.getStorage(type).removeItem(this.getKey(key));
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }

  /**
   * مسح جميع العناصر من التخزين
   * @param type - نوع التخزين
   */
  clear(type: StorageType = 'local'): void {
    try {
      const storage = this.getStorage(type);
      const keysToRemove: string[] = [];

      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => storage.removeItem(key));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * التحقق من وجود مفتاح
   * @param key - المفتاح
   * @param options - الخيارات
   * @returns true إذا كان موجوداً
   */
  has(key: string, options: StorageOptions = {}): boolean {
    return this.get(key, options) !== null;
  }

  /**
   * الحصول على جميع المفاتيح
   * @param type - نوع التخزين
   * @returns قائمة المفاتيح
   */
  keys(type: StorageType = 'local'): string[] {
    const storage = this.getStorage(type);
    const keys: string[] = [];

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.slice(this.prefix.length));
      }
    }

    return keys;
  }

  /**
   * الحصول على حجم التخزين المستخدم
   * @param type - نوع التخزين
   * @returns الحجم بالبايت
   */
  size(type: StorageType = 'local'): number {
    const storage = this.getStorage(type);
    let size = 0;

    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(this.prefix)) {
        const value = storage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
    }

    return size * 2; // UTF-16 = 2 bytes per character
  }
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🌍 instance عام
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export const storage = new StorageManager();

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 دوال مساعدة مباشرة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

/**
 * حفظ في localStorage
 * @param key - المفتاح
 * @param value - القيمة
 * @param expires - مدة الصلاحية بالمللي ثانية
 */
export function setLocalStorage<T>(key: string, value: T, expires?: number): void {
  storage.set(key, value, { type: 'local', expires });
}

/**
 * استرجاع من localStorage
 * @param key - المفتاح
 * @returns القيمة أو null
 */
export function getLocalStorage<T>(key: string): T | null {
  return storage.get<T>(key, { type: 'local' });
}

/**
 * حفظ في sessionStorage
 * @param key - المفتاح
 * @param value - القيمة
 */
export function setSessionStorage<T>(key: string, value: T): void {
  storage.set(key, value, { type: 'session' });
}

/**
 * استرجاع من sessionStorage
 * @param key - المفتاح
 * @returns القيمة أو null
 */
export function getSessionStorage<T>(key: string): T | null {
  return storage.get<T>(key, { type: 'session' });
}

/**
 * إزالة من localStorage
 * @param key - المفتاح
 */
export function removeLocalStorage(key: string): void {
  storage.remove(key, { type: 'local' });
}

/**
 * إزالة من sessionStorage
 * @param key - المفتاح
 */
export function removeSessionStorage(key: string): void {
  storage.remove(key, { type: 'session' });
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🍪 إدارة الكوكيز
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface CookieOptions {
  expires?: Date | number; // Date أو أيام
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

/**
 * تعيين كوكي
 * @param name - اسم الكوكي
 * @param value - القيمة
 * @param options - الخيارات
 */
export function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const { expires, path = '/', domain, secure, sameSite = 'lax' } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    const date = expires instanceof Date ? expires : new Date(Date.now() + expires * 86400000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; samesite=${sameSite}`;

  document.cookie = cookieString;
}

/**
 * الحصول على قيمة كوكي
 * @param name - اسم الكوكي
 * @returns القيمة أو null
 */
export function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (decodeURIComponent(cookieName) === name) {
      return decodeURIComponent(cookieValue);
    }
  }

  return null;
}

/**
 * إزالة كوكي
 * @param name - اسم الكوكي
 * @param path - المسار
 * @param domain - النطاق
 */
export function removeCookie(name: string, path: string = '/', domain?: string): void {
  setCookie(name, '', { expires: new Date(0), path, domain });
}

/**
 * الحصول على جميع الكوكيز
 * @returns كائن يحتوي على جميع الكوكيز
 */
export function getAllCookies(): Record<string, string> {
  const cookies: Record<string, string> = {};

  document.cookie.split(';').forEach((cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[decodeURIComponent(name)] = decodeURIComponent(value);
    }
  });

  return cookies;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📦 IndexedDB (للبيانات الكبيرة)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export class IndexedDBManager {
  private dbName: string;
  private version: number;
  private db: IDBDatabase | null = null;

  constructor(dbName: string = 'BoltAppDB', version: number = 1) {
    this.dbName = dbName;
    this.version = version;
  }

  /**
   * فتح قاعدة البيانات
   * @returns وعد بقاعدة البيانات
   */
  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('data')) {
          db.createObjectStore('data', { keyPath: 'key' });
        }
      };
    });
  }

  /**
   * حفظ بيانات
   * @param key - المفتاح
   * @param value - القيمة
   */
  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(['data'], 'readwrite');
    const store = transaction.objectStore('data');

    return new Promise((resolve, reject) => {
      const request = store.put({ key, value, updatedAt: Date.now() });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * استرجاع بيانات
   * @param key - المفتاح
   * @returns القيمة أو null
   */
  async get<T>(key: string): Promise<T | null> {
    const db = await this.open();
    const transaction = db.transaction(['data'], 'readonly');
    const store = transaction.objectStore('data');

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.value : null);
      };
    });
  }

  /**
   * إزالة بيانات
   * @param key - المفتاح
   */
  async remove(key: string): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(['data'], 'readwrite');
    const store = transaction.objectStore('data');

    return new Promise((resolve, reject) => {
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  /**
   * مسح جميع البيانات
   */
  async clear(): Promise<void> {
    const db = await this.open();
    const transaction = db.transaction(['data'], 'readwrite');
    const store = transaction.objectStore('data');

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

/**
 * instance عام لـ IndexedDB
 */
export const indexedDB = new IndexedDBManager();
