import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { workbenchStore } from '~/lib/stores/workbench';
import { DeployButton } from '~/components/deploy/DeployButton';
import { useTheme } from '~/contexts/ThemeContext';
import { dependencyAwarenessService } from '~/lib/services/dependencyAwarenessService';
import { securityScannerService } from '~/lib/services/securityScannerService';
import { staticAnalysisService } from '~/lib/services/staticAnalysisService';
import { toast } from 'react-toastify';

interface HeaderActionButtonsProps {
  chatStarted: boolean;
}

export function HeaderActionButtons({ chatStarted: _chatStarted }: HeaderActionButtonsProps) {
  const [activePreviewIndex] = useState(0);
  const previews = useStore(workbenchStore.previews);
  const activePreview = previews[activePreviewIndex];
  const { updateDesignScheme, resetToDefault, designScheme } = useTheme();

  const shouldShowButtons = activePreview;

  const runDependencyScan = async () => {
    try {
      const results = await dependencyAwarenessService.scanPackageJson();
      toast.success('Dependency scan completed');
      console.log('Dependency scan results:', results);
    } catch (error) {
      console.error('Dependency scan failed:', error);
      toast.error('Dependency scan failed');
    }
  };

  const runSecurityScan = async () => {
    try {
      const results = await securityScannerService.runFullSecurityScan();
      toast.success('Security scan completed');
      console.log('Security scan results:', results);
    } catch (error) {
      console.error('Security scan failed:', error);
      toast.error('Security scan failed');
    }
  };

  const runStaticAnalysis = async () => {
    try {
      const results = await staticAnalysisService.runFullAnalysis();
      toast.success('Static analysis completed');
      console.log('Static analysis results:', results);
    } catch (error) {
      console.error('Static analysis failed:', error);
      toast.error('Static analysis failed');
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* Deploy Button */}
      {shouldShowButtons && <DeployButton />}

      {/* Design & Theme Controls */}
      {shouldShowButtons && (
        <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden text-sm">
          <button
            onClick={() => {
              const newFeatures = designScheme.features.includes('rounded')
                ? designScheme.features.filter((f) => f !== 'rounded')
                : [...designScheme.features, 'rounded'];
              updateDesignScheme({ features: newFeatures });
              toast.success(`Rounded corners ${newFeatures.includes('rounded') ? 'enabled' : 'disabled'}`);
            }}
            className="items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-2 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1"
            title="Toggle Rounded Corners"
          >
            <div
              className={`i-ph:shapes-duotone ${designScheme.features.includes('rounded') ? 'text-yellow-300' : ''}`}
            />
          </button>

          <button
            onClick={() => {
              const newFeatures = designScheme.features.includes('shadow')
                ? designScheme.features.filter((f) => f !== 'shadow')
                : [...designScheme.features, 'shadow'];
              updateDesignScheme({ features: newFeatures });
              toast.success(`Shadows ${newFeatures.includes('shadow') ? 'enabled' : 'disabled'}`);
            }}
            className="items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-2 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1"
            title="Toggle Shadows"
          >
            <div
              className={`i-ph:drop-shadow-duotone ${designScheme.features.includes('shadow') ? 'text-gray-300' : ''}`}
            />
          </button>

          <button
            onClick={resetToDefault}
            className="items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-2 py-1.5 text-xs bg-red-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-red-600 outline-red-500 flex gap-1"
            title="Reset to Default Theme"
          >
            <div className="i-ph:arrow-clockwise-duotone" />
          </button>
        </div>
      )}

      {/* Update & Analysis Tools */}
      {shouldShowButtons && (
        <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden text-sm ml-1">
          <button
            onClick={runDependencyScan}
            className="items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-2 py-1.5 text-xs bg-blue-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-blue-600 outline-blue-500 flex gap-1"
            title="Scan Dependencies"
          >
            <div className="i-ph:package-duotone" />
          </button>

          <button
            onClick={runSecurityScan}
            className="items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-2 py-1.5 text-xs bg-orange-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-orange-600 outline-orange-500 flex gap-1"
            title="Run Security Scan"
          >
            <div className="i-ph:shield-duotone" />
          </button>

          <button
            onClick={runStaticAnalysis}
            className="items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-2 py-1.5 text-xs bg-green-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-green-600 outline-green-500 flex gap-1"
            title="Run Code Analysis"
          >
            <div className="i-ph:code-duotone" />
          </button>
        </div>
      )}

      {/* Debug Tools */}
      {shouldShowButtons && (
        <div className="flex border border-bolt-elements-borderColor rounded-md overflow-hidden text-sm ml-1">
          <button
            onClick={() =>
              window.open('https://github.com/stackblitz-labs/bolt.diy/issues/new?template=bug_report.yml', '_blank')
            }
            className="rounded-l-md items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-2 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1"
            title="Report Bug"
          >
            <div className="i-ph:bug-duotone" />
          </button>
          <div className="w-px bg-bolt-elements-borderColor" />
          <button
            onClick={async () => {
              try {
                const { downloadDebugLog } = await import('~/utils/debugLogger');
                await downloadDebugLog();
              } catch (error) {
                console.error('Failed to download debug log:', error);
              }
            }}
            className="rounded-r-md items-center justify-center [&:is(:disabled,.disabled)]:cursor-not-allowed [&:is(:disabled,.disabled)]:opacity-60 px-2 py-1.5 text-xs bg-accent-500 text-white hover:text-bolt-elements-item-contentAccent [&:not(:disabled,.disabled)]:hover:bg-bolt-elements-button-primary-backgroundHover outline-accent-500 flex gap-1"
            title="Download Debug Log"
          >
            <div className="i-ph:download-duotone" />
          </button>
        </div>
      )}
    </div>
  );
}
