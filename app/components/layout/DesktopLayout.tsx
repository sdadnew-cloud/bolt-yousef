import React from 'react';

interface DesktopLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  workbench?: React.ReactNode;
}

export const DesktopLayout: React.FC<DesktopLayoutProps> = ({ children, sidebar, header, workbench }) => {
  return (
    <div className="flex h-screen w-full bg-bolt-elements-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 flex-shrink-0">
        {sidebar}
      </aside>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        {header && <div className="flex-shrink-0">{header}</div>}

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 overflow-y-auto min-w-0">{children}</main>

          {/* Workbench / Preview Pane */}
          {workbench && (
            <aside className="w-[400px] border-l border-bolt-elements-borderColor bg-bolt-elements-background-depth-2 flex-shrink-0 hidden xl:block">
              {workbench}
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
