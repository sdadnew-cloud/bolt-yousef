import React, { useEffect, useState } from 'react';
import { Card } from '~/components/ui/Card';
import { eventTracker, type TrackedEvent } from '~/lib/analytics/event-tracker';

interface AnalyticsStatProps {
  title: string;
  value: string | number;
  icon?: string;
}

const AnalyticsStat = ({ title, value, icon }: AnalyticsStatProps) => (
  <Card className="p-4 flex flex-col gap-2 border-bolt-elements-borderColor">
    <div className="flex justify-between items-start">
      <span className="text-sm text-bolt-elements-textSecondary font-medium">{title}</span>
      {icon && <div className={icon + ' text-bolt-elements-textTertiary'} />}
    </div>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-bolt-elements-textPrimary">{value}</span>
    </div>
  </Card>
);

export const AnalyticsDashboard: React.FC = () => {
  const [events, setEvents] = useState<TrackedEvent[]>([]);

  useEffect(() => {
    // جلب الأحداث من التخزين المحلي الحقيقي
    setEvents(eventTracker.getLocalEvents());
  }, []);

  const stats = [
    {
      title: 'المشاريع المنشأة',
      value: events.filter(e => e.event === 'project_created').length,
      icon: 'i-ph:folder-plus'
    },
    {
      title: 'الكود المولد (مرات)',
      value: events.filter(e => e.event === 'code_generated').length,
      icon: 'i-ph:code'
    },
    {
      title: 'الأخطاء المسجلة',
      value: events.filter(e => e.event === 'error_occurred').length,
      icon: 'i-ph:warning-circle'
    },
    {
      title: 'إجمالي العمليات',
      value: events.length,
      icon: 'i-ph:activity'
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-6 bg-bolt-elements-background-depth-1 min-h-full">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-bolt-elements-textPrimary font-arabic">لوحة تحليلات المنصة</h1>
        <p className="text-bolt-elements-textSecondary">بيانات حقيقية من استخدامك الحالي للمنصة</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <AnalyticsStat key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-bolt-elements-textPrimary font-arabic">أحدث النشاطات الحقيقية</h2>
          <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto">
            {events.length > 0 ? (
              events.slice().reverse().map((event, idx) => (
                <div key={idx} className="flex justify-between items-center text-sm border-b border-bolt-elements-borderColor pb-2 last:border-0">
                  <div className="flex flex-col">
                    <span className="font-medium text-bolt-elements-textPrimary uppercase text-[10px] tracking-wider">{event.event}</span>
                    <span className="text-xs text-bolt-elements-textSecondary">
                      {event.properties.provider || 'System'} - {event.properties.model || ''}
                    </span>
                  </div>
                  <span className="text-[10px] text-bolt-elements-textTertiary">
                    {new Date(event.timestamp).toLocaleTimeString('ar-EG')}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-bolt-elements-textSecondary py-10">لا توجد نشاطات مسجلة بعد.</p>
            )}
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-bolt-elements-textSecondary">
            <div className="mb-2 text-4xl text-accent-500">📈</div>
            <p className="font-arabic">سيتم تجميع الرسوم البيانية هنا مع زيادة البيانات.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
