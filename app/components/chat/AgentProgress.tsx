import React from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { classNames } from '~/utils/classNames';

export const AgentProgress: React.FC = () => {
  const agentState = useStore(workbenchStore.agentState);

  if (!agentState.active) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor rounded-lg mb-4 animate-pulse">
      <div className="flex-shrink-0">
        <div className="i-ph:robot-duotone text-xl text-accent-500" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-bolt-elements-textPrimary">{agentState.agentName}</span>
          {agentState.step && (
            <span className="text-xs bg-accent-500/20 text-accent-500 px-1.5 py-0.5 rounded">الخطوة {agentState.step}</span>
          )}
        </div>
        <p className="text-xs text-bolt-elements-textSecondary truncate">{agentState.message}</p>
      </div>
      <div className="flex-shrink-0">
        <div className="i-ph:circle-notch animate-spin text-accent-500" />
      </div>
    </div>
  );
};
