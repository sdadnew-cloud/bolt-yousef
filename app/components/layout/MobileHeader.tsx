import React from 'react';
import { IconButton } from '~/components/ui/IconButton';

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex items-center justify-between px-4 h-16 border-b border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 md:hidden">
      <div className="flex items-center gap-2">
        <IconButton icon="i-ph:list" onClick={onMenuClick} title="Open Menu" />
        <div className="flex items-center gap-1.5 font-bold text-bolt-elements-textPrimary">
          <div className="i-bolt:logo text-2xl" />
          <span>yousef sh</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <IconButton icon="i-ph:plus" title="New Project" />
        <IconButton icon="i-ph:user-circle" title="Account" />
      </div>
    </header>
  );
};
