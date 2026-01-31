import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { themeStore } from '~/lib/stores/theme';
import { classNames } from '~/utils/classNames';
import { useTheme } from '~/contexts/ThemeContext';
import { DeployButton } from '~/components/deploy/DeployButton';
import { ClientOnly } from 'remix-utils/client-only';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { dependencyAwarenessService } from '~/lib/services/dependencyAwarenessService';
import { securityScannerService } from '~/lib/services/securityScannerService';
import { staticAnalysisService } from '~/lib/services/staticAnalysisService';
import { toast } from 'react-toastify';

export function NewHeader() {
  const chat = useStore(chatStore);
  const currentTheme = useStore(themeStore);
  const { designScheme, toggleTheme, resetToDefault, updateDesignScheme } = useTheme();
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [isUpgradeMenuOpen, setIsUpgradeMenuOpen] = useState(false);
  const [isDesignMenuOpen, setIsDesignMenuOpen] = useState(false);
  
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

  const applyCustomTheme = (presetName: string) => {
    // Different preset themes
    const presets: Record<string, any> = {
      default: {
        palette: {
          primary: '#9E7FFF',
          secondary: '#38bdf8',
          accent: '#f472b6',
          background: '#171717',
          surface: '#262626',
          text: '#FFFFFF',
          textSecondary: '#A3A3A3',
          border: '#2F2F2F',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
        }
      },
      android: {
        palette: {
          primary: '#1E88E5', // Android Blue - Material Design 3
          secondary: '#42A5F5', // Light Blue - Material Design 3
          accent: '#FFC107', // Amber - Material Design 3
          background: '#000000', // Dark background for AMOLED screens
          surface: '#121212', // Material Design dark surface
          text: '#FFFFFF', // White text
          textSecondary: '#B3B3B3', // Light gray text
          border: '#212121', // Dark border
          success: '#4CAF50', // Material Green
          warning: '#FF9800', // Material Orange
          error: '#F44336', // Material Red
        }
      },
      ocean: {
        palette: {
          primary: '#3b82f6',
          secondary: '#60a5fa',
          accent: '#93c5fd',
          background: '#0f172a',
          surface: '#1e293b',
          text: '#f8fafc',
          textSecondary: '#cbd5e1',
          border: '#334155',
          success: '#86efac',
          warning: '#fde68a',
          error: '#fecaca',
        }
      },
      forest: {
        palette: {
          primary: '#22c55e',
          secondary: '#4ade80',
          accent: '#86efac',
          background: '#052e16',
          surface: '#166534',
          text: '#ecfdf5',
          textSecondary: '#a7f3d0',
          border: '#166534',
          success: '#86efac',
          warning: '#fde68a',
          error: '#fecaca',
        }
      },
      sunset: {
        palette: {
          primary: '#f97316',
          secondary: '#fb923c',
          accent: '#fdba74',
          background: '#1a2e05',
          surface: '#4d7c0f',
          text: '#fefce8',
          textSecondary: '#facc15',
          border: '#65a30d',
          success: '#86efac',
          warning: '#fde68a',
          error: '#fecaca',
        }
      }
    };

    const selectedPreset = presets[presetName];
    if (selectedPreset) {
      updateDesignScheme(selectedPreset);
      toast.success(`${presetName.charAt(0).toUpperCase() + presetName.slice(1)} theme applied!`);
      setIsThemePickerOpen(false);
    }
  };

  return (
    <header
      className={classNames(
        'flex items-center px-4 border-b h-[var(--header-height)]',
        'bg-[var(--color-background)]',
        'border-[var(--color-border)]',
        'text-[var(--color-text)]',
        'transition-colors duration-300'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 z-logo text-[var(--color-text)] cursor-pointer">
        <div className="i-ph:palette-duotone text-xl" />
        <a href="/" className="text-2xl font-semibold flex items-center">
          <img 
            src="/logo-light-styled.png" 
            alt="logo" 
            className="w-[90px] inline-block dark:hidden invert brightness-100" 
            style={{ filter: 'invert(1) brightness(2)' }}
          />
          <img 
            src="/logo-dark-styled.png" 
            alt="logo" 
            className="w-[90px] inline-block hidden dark:block" 
          />
        </a>
      </div>

      {chat.started && (
        <>
          <span className="flex-1 px-4 truncate text-center text-[var(--color-text)]">
            <ClientOnly>{() => <ChatDescription />}</ClientOnly>
          </span>

          {/* Main Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Theme Selector */}
            <div className="relative">
              <button
                onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                className="p-2 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                title="Change Theme"
              >
                <div className="i-ph:paint-brush-duotone" />
              </button>

              {isThemePickerOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] z-50"
                  onMouseLeave={() => setIsThemePickerOpen(false)}
                >
                  <div className="py-1">
                    <button
                      onClick={() => applyCustomTheme('default')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                    >
                      Default Theme
                    </button>
                    <button
                      onClick={() => applyCustomTheme('android')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                    >
                      Android Material
                    </button>
                    <button
                      onClick={() => applyCustomTheme('ocean')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                    >
                      Ocean Theme
                    </button>
                    <button
                      onClick={() => applyCustomTheme('forest')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                    >
                      Forest Theme
                    </button>
                    <button
                      onClick={() => applyCustomTheme('sunset')}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                    >
                      Sunset Theme
                    </button>
                    <button
                      onClick={resetToDefault}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors text-red-500"
                    >
                      Reset Theme
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Design Features Menu */}
            <div className="relative">
              <button
                onClick={() => setIsDesignMenuOpen(!isDesignMenuOpen)}
                className="p-2 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                title="Design Features"
              >
                <div className="i-ph:sliders-duotone" />
              </button>

              {isDesignMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] z-50"
                  onMouseLeave={() => setIsDesignMenuOpen(false)}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-[var(--color-textSecondary)] uppercase tracking-wider">
                      Design Features
                    </div>
                    <button
                      onClick={() => {
                        const newFeatures = designScheme.features.includes('rounded') 
                          ? designScheme.features.filter(f => f !== 'rounded')
                          : [...designScheme.features, 'rounded'];
                        updateDesignScheme({ features: newFeatures });
                        toast.success(`Rounded corners ${newFeatures.includes('rounded') ? 'enabled' : 'disabled'}`);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors ${
                        designScheme.features.includes('rounded') ? 'text-[var(--color-primary)]' : ''
                      }`}
                    >
                      Rounded Corners
                    </button>
                    <button
                      onClick={() => {
                        const newFeatures = designScheme.features.includes('border') 
                          ? designScheme.features.filter(f => f !== 'border')
                          : [...designScheme.features, 'border'];
                        updateDesignScheme({ features: newFeatures });
                        toast.success(`Borders ${newFeatures.includes('border') ? 'enabled' : 'disabled'}`);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors ${
                        designScheme.features.includes('border') ? 'text-[var(--color-primary)]' : ''
                      }`}
                    >
                      Subtle Borders
                    </button>
                    <button
                      onClick={() => {
                        const newFeatures = designScheme.features.includes('shadow') 
                          ? designScheme.features.filter(f => f !== 'shadow')
                          : [...designScheme.features, 'shadow'];
                        updateDesignScheme({ features: newFeatures });
                        toast.success(`Shadows ${newFeatures.includes('shadow') ? 'enabled' : 'disabled'}`);
                      }}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors ${
                        designScheme.features.includes('shadow') ? 'text-[var(--color-primary)]' : ''
                      }`}
                    >
                      Soft Shadows
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Upgrade Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUpgradeMenuOpen(!isUpgradeMenuOpen)}
                className="p-2 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                title="Platform Updates"
              >
                <div className="i-ph:arrow-circle-down" />
              </button>

              {isUpgradeMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-[var(--color-surface)] ring-1 ring-[var(--color-border)] z-50"
                  onMouseLeave={() => setIsUpgradeMenuOpen(false)}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-xs text-[var(--color-textSecondary)] uppercase tracking-wider">
                      System Updates
                    </div>
                    <button
                      onClick={runDependencyScan}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                    >
                      Check Dependencies
                    </button>
                    <button
                      onClick={runSecurityScan}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                    >
                      Security Scan
                    </button>
                    <button
                      onClick={runStaticAnalysis}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors"
                    >
                      Code Analysis
                    </button>
                    <div className="border-t my-1 border-[var(--color-border)]"></div>
                    <button
                      onClick={() => {
                        toast.info('Platform upgrades feature in development');
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-[var(--color-primary)]/[0.2] transition-colors text-green-500"
                    >
                      Check for Updates
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-primary)]/[0.2] transition-colors"
              title="Toggle Theme"
            >
              {currentTheme === 'dark' ? <div className="i-ph:sun-duotone" /> : <div className="i-ph:moon-duotone" />}
            </button>

            {/* Deploy Button */}
            <DeployButton />
          </div>
        </>
      )}
    </header>
  );
}