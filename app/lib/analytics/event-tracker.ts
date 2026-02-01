/**
 * نظام تتبع الأحداث لمنصة yousef sh
 */

export interface TrackedEvent {
  event: 'project_created' | 'code_generated' | 'deployment' | 'error_occurred' | 'user_login' | 'file_changed';
  timestamp: string;
  properties: Record<string, any>;
}

class EventTracker {
  private static instance: EventTracker;
  private webhooks: string[] = [];

  private constructor() {
    // التحميل الأولي للإعدادات إذا لزم الأمر
  }

  public static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  /**
   * تسجيل حدث جديد
   */
  public async track(event: TrackedEvent['event'], properties: Record<string, any>) {
    const eventData: TrackedEvent = {
      event,
      timestamp: new Date().toISOString(),
      properties,
    };

    console.log(`[Analytics] Tracking event: ${event}`, eventData);

    // 1. التخزين في قاعدة البيانات الداخلية (محاكاة هنا)
    await this.saveToInternalDB(eventData);

    // 2. إرسال إلى Webhooks المشتركة
    await this.notifyWebhooks(eventData);

    // 3. التكامل مع Google Analytics (اختياري)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event, properties);
    }
  }

  private async saveToInternalDB(event: TrackedEvent) {
    // في بيئة حقيقية، سيتم استدعاء API أو Prisma هنا
    // حالياً نكتفي بتسجيلها في الكونسول
  }

  private async notifyWebhooks(event: TrackedEvent) {
    for (const url of this.webhooks) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Analytics-Event': event.event,
          },
          body: JSON.stringify(event),
        });
      } catch (error) {
        console.error(`[Analytics] Failed to notify webhook: ${url}`, error);
      }
    }
  }

  public addWebhook(url: string) {
    if (!this.webhooks.includes(url)) {
      this.webhooks.push(url);
    }
  }
}

export const eventTracker = EventTracker.getInstance();
