/**
 * 📁 ملف: ResponsiveLayout.tsx
 * 📝 وصف: نظام التخطيط المتجاوب (Responsive Layout System)
 * 🔧 الغرض: التبديل التلقائي بين واجهات الموبايل، التابلت، والديسكتاب
 */

import React, { useState, useEffect, forwardRef } from 'react';
import { useMediaQuery } from '~/lib/hooks/use-media-query';
import { MobileHeader } from './MobileHeader';
import { DrawerSidebar } from './DrawerSidebar';
import { DesktopLayout } from './DesktopLayout';
import { TabButton } from '~/components/editor/TabButton';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  workbench?: React.ReactNode;
}

export const ResponsiveLayout = forwardRef<HTMLDivElement, ResponsiveLayoutProps>(
  ({ children, sidebar, header, workbench }, ref) => {
    // كشف حجم الشاشة
    const isMobile = useMediaQuery('(max-width: 767px)');
    const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [mobileTab, setMobileTab] = useState<'chat' | 'workbench'>('chat');

    // إغلاق القائمة الجانبية عند التبديل لنسخة الديسكتاب
    useEffect(() => {
      if (!isMobile) {
        setIsSidebarOpen(false);
      }
    }, [isMobile]);

    // تخطيط الموبايل (أقل من 768 بكسل)
    if (isMobile) {
      return (
        <div ref={ref} className="flex flex-col h-screen w-full bg-bolt-elements-background overflow-hidden">
          <MobileHeader onMenuClick={() => setIsSidebarOpen(true)} />
          <DrawerSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}>
            {sidebar}
          </DrawerSidebar>

          <main className="flex-1 overflow-hidden relative safe-area-bottom">
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${mobileTab === 'chat' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              <div className="h-full overflow-y-auto">{children}</div>
            </div>
            <div
              className={`absolute inset-0 transition-opacity duration-200 ${mobileTab === 'workbench' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
            >
              <div className="h-full overflow-y-auto">{workbench}</div>
            </div>
          </main>

          {/* شريط التنقل السفلي للموبايل */}
          <div className="flex border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-1">
            <TabButton
              active={mobileTab === 'chat'}
              onClick={() => setMobileTab('chat')}
              icon="i-ph:chat-centered-text"
              label="الدردشة"
            />
            <TabButton
              active={mobileTab === 'workbench'}
              onClick={() => setMobileTab('workbench')}
              icon="i-ph:code-block"
              label="بيئة العمل"
            />
          </div>
        </div>
      );
    }

    // تخطيط التابلت (768 بكسل - 1023 بكسل)
    if (isTablet) {
      return (
        <div ref={ref} className="flex h-screen w-full bg-bolt-elements-background overflow-hidden">
          <aside className="w-64 border-r border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 hidden md:block">
            {sidebar}
          </aside>
          <div className="flex flex-col flex-1 overflow-hidden">
            {header}
            <main className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-4 p-4">
                {children}
                {workbench && <div className="border-t border-bolt-elements-borderColor pt-4">{workbench}</div>}
              </div>
            </main>
          </div>
        </div>
      );
    }

    // تخطيط الديسكتاب (أكبر من 1024 بكسل)
    return (
      <div ref={ref} className="h-full w-full">
        <DesktopLayout sidebar={sidebar} header={header} workbench={workbench}>
          {children}
        </DesktopLayout>
      </div>
    );
  },
);

ResponsiveLayout.displayName = 'ResponsiveLayout';
