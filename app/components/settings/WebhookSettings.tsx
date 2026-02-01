import React, { useState } from 'react';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { webhookManager, type WebhookEvent } from '~/lib/integrations/webhook-manager';

export const WebhookSettings: React.FC = () => {
  const [url, setUrl] = useState('');
  const [secret, setSecret] = useState('');
  const [webhooks, setWebhooks] = useState(webhookManager.getWebhooks());

  const addWebhook = () => {
    if (!url) return;

    webhookManager.addWebhook({
      url,
      secret,
      enabled: true,
      events: ['project.created', 'code.generated', 'error.occurred']
    });

    setWebhooks([...webhookManager.getWebhooks()]);
    setUrl('');
    setSecret('');
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <Card className="p-6 border-bolt-elements-borderColor">
        <h3 className="text-lg font-bold mb-4 text-bolt-elements-textPrimary">إدارة Webhooks</h3>

        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-bolt-elements-textSecondary">رابط الـ Webhook (N8N, Zapier...)</label>
            <Input
              placeholder="https://n8n.example.com/webhook/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-bolt-elements-textSecondary">السر (Secret) للتحقق</label>
            <Input
              type="password"
              placeholder="أدخل السر هنا..."
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
            />
          </div>

          <Button onClick={addWebhook} className="w-fit bg-accent-500 hover:bg-accent-600 text-white">
            إضافة Webhook حقيقي
          </Button>
        </div>

        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-bolt-elements-textSecondary border-b pb-2">الروابط النشطة</h4>
          {webhooks.length > 0 ? (
            webhooks.map((w, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-bolt-elements-background-depth-3 rounded-lg text-sm border border-bolt-elements-borderColor">
                <div className="truncate flex-1 mr-4 text-bolt-elements-textPrimary">{w.url}</div>
                <div className={`text-[10px] px-2 py-0.5 rounded-full ${w.enabled ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {w.enabled ? 'نشط' : 'معطل'}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-bolt-elements-textTertiary text-center py-4">لا توجد روابط نشطة حالياً.</p>
          )}
        </div>
      </Card>
    </div>
  );
};
