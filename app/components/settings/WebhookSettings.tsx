import React, { useState, useEffect } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { webhookManager, type WebhookEvent, type WebhookConfig } from '~/lib/integrations/webhook-manager';
import { toast } from 'react-toastify';

export const WebhookSettings: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [newUrl, setNewUrl] = useState('');
  const [newSecret, setNewSecret] = useState('');

  useEffect(() => {
    setWebhooks(webhookManager.getWebhooks());
  }, []);

  const handleAddWebhook = () => {
    if (!newUrl) {
      toast.error('الرجاء إدخال URL صالح');
      return;
    }

    const config: WebhookConfig = {
      url: newUrl,
      secret: newSecret,
      enabled: true,
      events: ['project.created', 'project.deployed', 'code.generated', 'error.occurred', 'file.changed'],
    };

    webhookManager.addWebhook(config);
    setWebhooks([...webhooks, config]);
    setNewUrl('');
    setNewSecret('');
    toast.success('تم إضافة Webhook بنجاح');
  };

  return (
    <div className="space-y-6 p-4 bg-bolt-elements-background-depth-2 rounded-lg border border-bolt-elements-borderColor">
      <div>
        <h3 className="text-lg font-medium text-bolt-elements-textPrimary mb-2">N8N / Webhooks Integration</h3>
        <p className="text-sm text-bolt-elements-textSecondary mb-4">
          قم بتوصيل المنصة بـ N8N أو أي خدمة خارجية لتلقي إشعارات عن الأحداث المهمة.
        </p>
      </div>

      <div className="space-y-4 border-b border-bolt-elements-borderColor pb-6">
        <Input
          label="Webhook URL"
          placeholder="https://n8n.your-instance.com/webhook/..."
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
        />
        <Input
          label="Secret (Optional)"
          type="password"
          placeholder="كلمة مرور للتحقق"
          value={newSecret}
          onChange={(e) => setNewSecret(e.target.value)}
        />
        <Button onClick={handleAddWebhook} variant="primary">
          إضافة Webhook جديد
        </Button>
      </div>

      <div className="space-y-4">
        <h4 className="text-md font-medium text-bolt-elements-textPrimary">الروابط النشطة ({webhooks.length})</h4>
        {webhooks.length === 0 ? (
          <p className="text-sm text-bolt-elements-textTertiary italic">لا يوجد أي Webhooks مهيأة حالياً.</p>
        ) : (
          <div className="space-y-2">
            {webhooks.map((webhook, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-bolt-elements-background-depth-1 rounded-md border border-bolt-elements-borderColor">
                <div className="truncate flex-1 mr-4">
                  <p className="text-sm font-medium text-bolt-elements-textPrimary truncate">{webhook.url}</p>
                  <p className="text-xs text-bolt-elements-textTertiary">{webhook.events.length} events configured</p>
                </div>
                <div className={`h-2.5 w-2.5 rounded-full ${webhook.enabled ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
