import React from 'react';
import { classNames } from '~/utils/classNames';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}

export const TabButton: React.FC<TabButtonProps> = ({ active, onClick, icon, label }) => {
  return (
    <button
      onClick={onClick}
      className={classNames(
        'flex flex-col items-center justify-center flex-1 py-2 gap-1 transition-colors relative',
        active
          ? 'text-blue-500 bg-blue-500/5'
          : 'text-bolt-elements-textTertiary hover:text-bolt-elements-textSecondary',
      )}
    >
      <div className={classNames(icon, 'text-xl')} />
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      {active && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
    </button>
  );
};
