import React, { useState } from 'react';
import { TabButton } from './TabButton';
import { classNames } from '~/utils/classNames';

interface MobileEditorProps {
  code: string;
  onCodeChange: (newCode: string) => void;
  preview: React.ReactNode;
  terminal: React.ReactNode;
}

type EditorTab = 'code' | 'preview' | 'terminal';

export const MobileEditor: React.FC<MobileEditorProps> = ({
  code: _code,
  onCodeChange: _onCodeChange,
  preview,
  terminal,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('preview');

  return (
    <div className="flex flex-col h-full bg-bolt-elements-background">
      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className={classNames(
            'absolute inset-0 transition-opacity duration-200',
            activeTab === 'code' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none',
          )}
        >
          {/* Simple Mobile Editor or just a message for now */}
          <div className="p-4 text-center">
            <div className="i-ph:code text-4xl mx-auto mb-2 opacity-20" />
            <p className="text-bolt-elements-textSecondary">
              Code editor is optimized for larger screens. Use desktop mode for full editing capabilities.
            </p>
          </div>
        </div>

        <div
          className={classNames(
            'absolute inset-0 transition-opacity duration-200',
            activeTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none',
          )}
        >
          {preview}
        </div>

        <div
          className={classNames(
            'absolute inset-0 transition-opacity duration-200',
            activeTab === 'terminal' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none',
          )}
        >
          {terminal}
        </div>
      </div>

      {/* Bottom Tab Bar */}
      <div className="flex border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-1 relative">
        <TabButton active={activeTab === 'code'} onClick={() => setActiveTab('code')} icon="i-ph:code" label="Code" />
        <TabButton
          active={activeTab === 'preview'}
          onClick={() => setActiveTab('preview')}
          icon="i-ph:monitor"
          label="Preview"
        />
        <TabButton
          active={activeTab === 'terminal'}
          onClick={() => setActiveTab('terminal')}
          icon="i-ph:terminal-window"
          label="Terminal"
        />
      </div>
    </div>
  );
};
