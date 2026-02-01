import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';
import { type DesignScheme, defaultDesignScheme, paletteRoles, designFeatures, designFonts } from '~/types/design-scheme';
import { themeStore } from '~/lib/stores/theme';

export default function ThemeDesigner() {
  const [designScheme, setDesignScheme] = useState<DesignScheme>(() => {
    const saved = localStorage.getItem('bolt_design_scheme');
    return saved ? JSON.parse(saved) : defaultDesignScheme;
  });

  const [activeTab, setActiveTab] = useState<'palette' | 'features' | 'fonts'>('palette');
  const [customColors, setCustomColors] = useState<{ [key: string]: string }>({});

  // Initialize custom colors from design scheme
  useEffect(() => {
    const initialColors: { [key: string]: string } = {};
    Object.entries(designScheme.palette).forEach(([key, value]) => {
      initialColors[key] = value;
    });
    setCustomColors(initialColors);
  }, []);

  // Save design scheme to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bolt_design_scheme', JSON.stringify(designScheme));
    applyDesignScheme(designScheme);

    // Notify other parts of the app about the theme change
    window.dispatchEvent(new CustomEvent('designSchemeChanged', { detail: designScheme }));
  }, [designScheme]);

  const handleColorChange = (role: string, color: string) => {
    const updatedPalette = {
      ...designScheme.palette,
      [role]: color,
    };

    setDesignScheme((prev) => ({
      ...prev,
      palette: updatedPalette,
    }));

    setCustomColors((prev) => ({
      ...prev,
      [role]: color,
    }));
  };

  const handleFeatureToggle = (featureKey: string) => {
    const updatedFeatures = designScheme.features.includes(featureKey)
      ? designScheme.features.filter((f) => f !== featureKey)
      : [...designScheme.features, featureKey];

    setDesignScheme((prev) => ({
      ...prev,
      features: updatedFeatures,
    }));
  };

  const handleFontChange = (fontFamily: string[]) => {
    setDesignScheme((prev) => ({
      ...prev,
      font: fontFamily,
    }));
  };

  const applyDesignScheme = (scheme: DesignScheme) => {
    const root = document.documentElement;

    // Apply palette colors as CSS variables
    Object.entries(scheme.palette).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Apply font family
    root.style.setProperty('--font-family', scheme.font.join(', '));
  };

  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset to default theme?')) {
      setDesignScheme(defaultDesignScheme);
      setCustomColors(
        Object.fromEntries(Object.entries(defaultDesignScheme.palette).map(([key, value]) => [key, value])),
      );
      toast.success('Theme reset to default');
    }
  };

  const exportTheme = () => {
    const dataStr = JSON.stringify(designScheme, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = 'bolt-theme.json';

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast.success('Theme exported successfully');
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedScheme: DesignScheme = JSON.parse(e.target?.result as string);

        // Validate that it has the required structure
        if (importedScheme.palette && importedScheme.features && importedScheme.font) {
          setDesignScheme(importedScheme);

          // Update custom colors
          const importedColors: { [key: string]: string } = {};
          Object.entries(importedScheme.palette).forEach(([key, value]) => {
            importedColors[key] = value;
          });
          setCustomColors(importedColors);

          toast.success('Theme imported successfully');
        } else {
          toast.error('Invalid theme file format');
        }
      } catch (error) {
        toast.error('Error importing theme file');
        console.error(error);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-bolt-elements-textPrimary">Theme Designer</h2>
          <p className="text-sm text-bolt-elements-textSecondary">
            Customize your Bolt interface with colors, features, and fonts
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('palette')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === 'palette'
                ? 'bg-purple-500 text-white'
                : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:bg-bolt-elements-item-background'
            }`}
          >
            Palette
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === 'features'
                ? 'bg-purple-500 text-white'
                : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:bg-bolt-elements-item-background'
            }`}
          >
            Features
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeTab === 'fonts'
                ? 'bg-purple-500 text-white'
                : 'bg-bolt-elements-background-depth-2 text-bolt-elements-textSecondary hover:bg-bolt-elements-item-background'
            }`}
          >
            Fonts
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={resetToDefault}
          className="px-3 py-1.5 text-sm rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
        >
          Reset to Default
        </button>
        <button
          onClick={exportTheme}
          className="px-3 py-1.5 text-sm rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors"
        >
          Export Theme
        </button>
        <label className="px-3 py-1.5 text-sm rounded-lg bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 transition-colors cursor-pointer">
          Import Theme
          <input type="file" accept=".json" onChange={importTheme} className="hidden" />
        </label>
      </div>

      {/* Tab Content */}
      <div className="bg-bolt-elements-background-depth-2 rounded-lg p-4 min-h-[400px]">
        {activeTab === 'palette' && (
          <motion.div
            key="palette"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-md font-medium text-bolt-elements-textPrimary mb-4">Color Palette</h3>

            {paletteRoles.map((role) => (
              <div key={role.key} className="flex items-center gap-4 mb-3">
                <div className="w-24 flex-shrink-0">
                  <label className="block text-sm text-bolt-elements-textSecondary">{role.label}</label>
                  <span className="block text-xs text-bolt-elements-textTertiary mt-1">{role.description}</span>
                </div>

                <div className="flex items-center gap-3 flex-grow">
                  <div
                    className="w-10 h-10 rounded-md border border-bolt-elements-borderColor"
                    style={{ backgroundColor: customColors[role.key] }}
                  />

                  <input
                    type="color"
                    value={customColors[role.key] || '#ffffff'}
                    onChange={(e) => handleColorChange(role.key, e.target.value)}
                    className="w-12 h-10 border border-bolt-elements-borderColor rounded cursor-pointer"
                  />

                  <input
                    type="text"
                    value={customColors[role.key] || ''}
                    onChange={(e) => handleColorChange(role.key, e.target.value)}
                    className="px-3 py-1.5 text-sm rounded-lg bg-bolt-elements-background-depth-3 border border-bolt-elements-borderColor text-bolt-elements-textPrimary w-32"
                    placeholder="#HEX"
                  />
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === 'features' && (
          <motion.div
            key="features"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-md font-medium text-bolt-elements-textPrimary mb-4">Design Features</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {designFeatures.map((feature) => (
                <div
                  key={feature.key}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    designScheme.features.includes(feature.key)
                      ? 'bg-purple-500/10 border border-purple-500/30'
                      : 'bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-item-background'
                  }`}
                  onClick={() => handleFeatureToggle(feature.key)}
                >
                  <div>
                    <div className="text-bolt-elements-textPrimary font-medium">{feature.label}</div>
                    <div className="text-xs text-bolt-elements-textSecondary mt-1">
                      {feature.key === 'rounded' && 'Applies rounded corners to UI elements'}
                      {feature.key === 'border' && 'Adds subtle borders to UI elements'}
                      {feature.key === 'gradient' && 'Adds gradient accents to key elements'}
                      {feature.key === 'shadow' && 'Applies soft shadows to elevated elements'}
                      {feature.key === 'frosted-glass' && 'Creates frosted glass effect for overlays'}
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      designScheme.features.includes(feature.key)
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-bolt-elements-borderColor'
                    }`}
                  >
                    {designScheme.features.includes(feature.key) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 'fonts' && (
          <motion.div
            key="fonts"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-md font-medium text-bolt-elements-textPrimary mb-4">Typography</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {designFonts.map((font) => (
                <div
                  key={font.key}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    designScheme.font.includes(font.key)
                      ? 'bg-purple-500/10 border border-purple-500/30'
                      : 'bg-bolt-elements-background-depth-3 hover:bg-bolt-elements-item-background'
                  }`}
                  onClick={() => handleFontChange([font.key])}
                >
                  <div>
                    <div
                      className="text-bolt-elements-textPrimary font-medium"
                      style={{
                        fontFamily:
                          font.key === 'sans-serif'
                            ? 'ui-sans-serif, system-ui, sans-serif'
                            : font.key === 'serif'
                              ? 'ui-serif, Georgia, serif'
                              : font.key === 'monospace'
                                ? 'ui-monospace, SFMono-Regular, Monaco, Consolas'
                                : font.key === 'cursive'
                                  ? 'ui-script, cursive'
                                  : 'default',
                      }}
                    >
                      {font.label} <span className="opacity-70">- {font.preview}</span>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border-2 ${
                      designScheme.font.includes(font.key)
                        ? 'bg-purple-500 border-purple-500'
                        : 'border-bolt-elements-borderColor'
                    }`}
                  >
                    {designScheme.font.includes(font.key) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Preview Section */}
      <div
        className="bg-bolt-elements-background-depth-2 rounded-lg p-4"
        style={{
          backgroundColor: designScheme.palette.surface || '#262626',
          color: designScheme.palette.text || '#FFFFFF',
        }}
      >
        <h3 className="text-md font-medium text-bolt-elements-textPrimary mb-3">Theme Preview</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            className={`rounded-lg p-4 border ${designScheme.features.includes('rounded') ? 'rounded-lg' : ''} ${
              designScheme.features.includes('border') ? 'border' : 'border-transparent'
            }`}
            style={{
              backgroundColor: designScheme.palette.background || '#171717',
              borderColor: designScheme.palette.border || '#2F2F2F',
              boxShadow: designScheme.features.includes('shadow')
                ? '0 1px 3px 0 rgba(255,255,255,0.1), 0 1px 2px -1px rgba(255,255,255,0.1)'
                : 'none',
              backdropFilter: designScheme.features.includes('frosted-glass') ? 'blur(10px)' : 'none',
            }}
          >
            <h4 className="font-medium mb-2" style={{ color: designScheme.palette.primary || '#9E7FFF' }}>
              Sample Card
            </h4>
            <p className="text-sm" style={{ color: designScheme.palette.textSecondary || '#A3A3A3' }}>
              This is a sample card to preview your theme
            </p>
            <div className="flex gap-2 mt-3">
              <button
                className={`px-3 py-1.5 text-sm rounded ${designScheme.features.includes('rounded') ? 'rounded' : ''}`}
                style={{
                  backgroundColor: designScheme.palette.primary || '#9E7FFF',
                  color: designScheme.palette.text || '#FFFFFF',
                }}
              >
                Primary
              </button>
              <button
                className={`px-3 py-1.5 text-sm rounded ${designScheme.features.includes('rounded') ? 'rounded' : ''}`}
                style={{
                  border: `1px solid ${designScheme.palette.secondary || '#38bdf8'}`,
                  backgroundColor: 'transparent',
                  color: designScheme.palette.secondary || '#38bdf8',
                }}
              >
                Secondary
              </button>
            </div>
          </div>

          <div
            className={`rounded-lg p-4 border ${designScheme.features.includes('rounded') ? 'rounded-lg' : ''} ${
              designScheme.features.includes('border') ? 'border' : 'border-transparent'
            }`}
            style={{
              backgroundColor: designScheme.palette.surface || '#262626',
              borderColor: designScheme.palette.border || '#2F2F2F',
              boxShadow: designScheme.features.includes('shadow')
                ? '0 1px 3px 0 rgba(255,255,255,0.1), 0 1px 2px -1px rgba(255,255,255,0.1)'
                : 'none',
              backdropFilter: designScheme.features.includes('frosted-glass') ? 'blur(10px)' : 'none',
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: designScheme.palette.success || '#10b981' }}
              />
              <h4 className="font-medium" style={{ color: designScheme.palette.text || '#FFFFFF' }}>
                Status Card
              </h4>
            </div>
            <p className="text-sm" style={{ color: designScheme.palette.textSecondary || '#A3A3A3' }}>
              This card shows status with success indicator
            </p>
            <div className="mt-3 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                  style={{
                    backgroundColor: designScheme.palette.surface || '#262626',
                    color: designScheme.palette.text || '#FFFFFF',
                    border: `1px solid ${designScheme.palette.border || '#2F2F2F'}`,
                  }}
                >
                  {i}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`rounded-lg p-4 border ${designScheme.features.includes('rounded') ? 'rounded-lg' : ''} ${
              designScheme.features.includes('border') ? 'border' : 'border-transparent'
            }`}
            style={{
              backgroundColor: designScheme.palette.background || '#171717',
              borderColor: designScheme.palette.border || '#2F2F2F',
              boxShadow: designScheme.features.includes('shadow')
                ? '0 1px 3px 0 rgba(255,255,255,0.1), 0 1px 2px -1px rgba(255,255,255,0.1)'
                : 'none',
              backdropFilter: designScheme.features.includes('frosted-glass') ? 'blur(10px)' : 'none',
            }}
          >
            <h4 className="font-medium mb-2" style={{ color: designScheme.palette.accent || '#f472b6' }}>
              Accent Card
            </h4>
            <div className="space-y-2">
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: designScheme.palette.warning ? `${designScheme.palette.warning}20` : '#f59e0b20',
                  color: designScheme.palette.warning || '#f59e0b',
                }}
              >
                Warning message
              </div>
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: designScheme.palette.error ? `${designScheme.palette.error}20` : '#ef444420',
                  color: designScheme.palette.error || '#ef4444',
                }}
              >
                Error message
              </div>
              <div
                className="text-xs px-2 py-1 rounded"
                style={{
                  backgroundColor: designScheme.palette.success ? `${designScheme.palette.success}20` : '#10b98120',
                  color: designScheme.palette.success || '#10b981',
                }}
              >
                Success message
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
