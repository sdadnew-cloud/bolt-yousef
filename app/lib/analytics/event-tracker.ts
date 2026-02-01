/**
 * 📁 ملف: event-tracker.ts
 * 📝 وصف: نظام تتبع الأحداث الحقيقي (Real Event Tracking System)
 * 🔧 الغرض: تسجيل نشاطات المستخدم وأداء المنصة للتحليل
 */

export interface TrackedEvent {
  event: 'project_created' | 'code_generated' | 'deployment' | 'error_occurred' | 'user_login' | 'file_changed';
  timestamp: string;
  properties: Record<string, any>;
}

class EventTracker {
  private static instance: EventTracker;
  private webhooks: string[] = [];
  private STORAGE_KEY = 'yousef_sh_analytics';

  private constructor() {}

  public static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  /**
   * تسجيل حدث جديد بشكل حقيقي
   */
  public async track(event: TrackedEvent['event'], properties: Record<string, any>) {
    const eventData: TrackedEvent = {
      event,
      timestamp: new Date().toISOString(),
      properties,
    };

    console.log(`[Analytics] Tracking: ${event}`, eventData);

    // 1. التخزين المحلي (للوصول السريع في لوحة التحكم)
    this.saveToLocal(eventData);

    // 2. الإرسال إلى الخادم (للتخزين الدائم)
    await this.sendToServer(eventData);

    // 3. إشعار الـ Webhooks
    await this.notifyWebhooks(eventData);
  }

  private saveToLocal(event: TrackedEvent) {
    if (typeof window === 'undefined') return;

    try {
      const history = JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
      history.push(event);
      // الاحتفاظ بآخر 1000 حدث لتجنب امتلاء المساحة
      if (history.length > 1000) history.shift();
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  private async sendToServer(event: TrackedEvent) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (e) {
      console.warn('[Analytics] Could not send to server, but saved locally.');
    }
  }

  private async notifyWebhooks(event: TrackedEvent) {
    for (const url of this.webhooks) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
      } catch (error) {
        console.error(`[Analytics] Webhook failed: ${url}`, error);
      }
    }
  }

  public getLocalEvents(): TrackedEvent[] {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  public addWebhook(url: string) {
    if (!this.webhooks.includes(url)) this.webhooks.push(url);
  }
}

export const eventTracker = EventTracker.getInstance();
