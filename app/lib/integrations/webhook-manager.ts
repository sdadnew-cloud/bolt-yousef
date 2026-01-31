export type WebhookEvent =
  | 'project.created'
  | 'project.deployed'
  | 'code.generated'
  | 'error.occurred'
  | 'file.changed';

export interface WebhookConfig {
  url: string;
  secret?: string;
  enabled: boolean;
  events: WebhookEvent[];
}

export class WebhookManager {
  private static _instance: WebhookManager;
  private _webhooks: WebhookConfig[] = [];

  private constructor() {
    this._loadFromStorage();
  }

  static getInstance(): WebhookManager {
    if (!WebhookManager._instance) {
      WebhookManager._instance = new WebhookManager();
    }
    return WebhookManager._instance;
  }

  private _loadFromStorage() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('yousef_sh_webhooks');
      if (saved) {
        this._webhooks = JSON.parse(saved);
      }
    }
  }

  private _saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('yousef_sh_webhooks', JSON.stringify(this._webhooks));
    }
  }

  addWebhook(config: WebhookConfig) {
    this._webhooks.push(config);
    this._saveToStorage();
  }

  getWebhooks() {
    return this._webhooks;
  }

  async trigger(event: WebhookEvent, data: any) {
    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const activeWebhooks = this._webhooks.filter(w => w.enabled && w.events.includes(event));

    const results = await Promise.allSettled(
      activeWebhooks.map(webhook =>
        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(webhook.secret ? { 'X-Webhook-Secret': webhook.secret } : {}),
          },
          body: JSON.stringify(payload),
        })
      )
    );

    console.log(`Webhook triggers for ${event}:`, results);
  }
}

export const webhookManager = WebhookManager.getInstance();
