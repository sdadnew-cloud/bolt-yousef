import React, { useState } from 'react';
import { TabButton } from './TabButton';
import { classNames } from '~/utils/classNames';
import { CodeMirrorEditor, type EditorDocument, type EditorSettings } from '~/components/editor/codemirror/CodeMirrorEditor';
import { useStore } from '@nanostores/react';
import { themeStore } from '~/lib/stores/theme';

interface MobileEditorProps {
  editorDocument?: EditorDocument;
  onCodeChange?: (update: { content: string }) => void;
  onCodeSave?: () => void;
  preview: React.ReactNode;
  terminal: React.ReactNode;
  isStreaming?: boolean;
}

type EditorTab = 'code' | 'preview' | 'terminal';

const editorSettings: EditorSettings = { tabSize: 2 };

export const MobileEditor: React.FC<MobileEditorProps> = ({
  editorDocument,
  onCodeChange,
  onCodeSave,
  preview,
  terminal,
  isStreaming,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('preview');
  const theme = useStore(themeStore);

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
          {editorDocument ? (
            <div className="h-full flex flex-col">
              <div className="px-4 py-2 bg-bolt-elements-background-depth-2 text-xs font-medium text-bolt-elements-textSecondary border-b border-bolt-elements-borderColor truncate">
                {editorDocument.filePath}
              </div>
              <div className="flex-1 overflow-hidden">
                <CodeMirrorEditor
                  theme={theme}
                  editable={!isStreaming}
                  settings={editorSettings}
                  doc={editorDocument}
                  autoFocusOnDocumentChange={false}
                  onChange={onCodeChange}
                  onSave={onCodeSave}
                />
              </div>
            </div>
          ) : (
            <div className="p-4 text-center h-full flex flex-col justify-center items-center">
              <div className="i-ph:file-dashed text-4xl mb-2 opacity-20" />
              <p className="text-bolt-elements-textSecondary">No file selected</p>
            </div>
          )}
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
