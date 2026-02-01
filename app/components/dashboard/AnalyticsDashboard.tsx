import React from 'react';
import { Card } from '~/components/ui/Card';

interface AnalyticsStatProps {
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
}

const AnalyticsStat = ({ title, value, change, isPositive }: AnalyticsStatProps) => (
  <Card className="p-4 flex flex-col gap-2">
    <span className="text-sm text-bolt-elements-textSecondary font-medium">{title}</span>
    <div className="flex items-baseline gap-2">
      <span className="text-2xl font-bold text-bolt-elements-textPrimary">{value}</span>
      {change && (
        <span className={`text-xs font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {change}
        </span>
      )}
    </div>
  </Card>
);

export const AnalyticsDashboard: React.FC = () => {
  // في تطبيق حقيقي، سيتم جلب هذه البيانات من API
  const stats = [
    { title: 'المشاريع المنشأة', value: '1,284', change: '+12%', isPositive: true },
    { title: 'الكود المولد (Tokens)', value: '45.2M', change: '+5%', isPositive: true },
    { title: 'عمليات النشر الناجحة', value: '892', change: '+18%', isPositive: true },
    { title: 'الأخطاء المسجلة', value: '23', change: '-4%', isPositive: true },
  ];

  const recentEvents = [
    { id: 1, event: 'project_created', user: 'yousef_sh', time: 'منذ 5 دقائق' },
    { id: 2, event: 'code_generated', user: 'dev_user', time: 'منذ 12 دقيقة' },
    { id: 3, event: 'deployment', user: 'admin', time: 'منذ 45 دقيقة' },
  ];

  return (
    <div className="p-6 flex flex-col gap-6 bg-bolt-elements-background-depth-1 min-h-full">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-bolt-elements-textPrimary">لوحة تحليلات المنصة</h1>
        <p className="text-bolt-elements-textSecondary">نظرة عامة على أداء واستخدام yousef sh Platform</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <AnalyticsStat key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 border-b pb-2 text-bolt-elements-textPrimary">أحدث النشاطات</h2>
          <div className="flex flex-col gap-4">
            {recentEvents.map((event) => (
              <div key={event.id} className="flex justify-between items-center text-sm border-b border-bolt-elements-borderColor pb-2 last:border-0">
                <div className="flex flex-col">
                  <span className="font-medium text-bolt-elements-textPrimary">{event.event}</span>
                  <span className="text-xs text-bolt-elements-textSecondary">{event.user}</span>
                </div>
                <span className="text-xs text-bolt-elements-textTertiary">{event.time}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 flex items-center justify-center min-h-[300px]">
          <div className="text-center text-bolt-elements-textSecondary">
            <div className="mb-2 text-4xl">📊</div>
            <p>سيتم عرض الرسوم البيانية التفصيلية هنا (تكامل مع Recharts أو Chart.js)</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
