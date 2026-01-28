import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('DeviceEmulator');

export interface Device {
  id: string;
  name: string;
  type: 'mobile' | 'tablet' | 'desktop';
  width: number;
  height: number;
  devicePixelRatio: number;
  userAgent: string;
  platform: string;
}

export const devices: Device[] = [
  {
    id: 'iphone14',
    name: 'iPhone 14',
    type: 'mobile',
    width: 390,
    height: 844,
    devicePixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    platform: 'iOS'
  },
  {
    id: 'iphone14pro',
    name: 'iPhone 14 Pro',
    type: 'mobile',
    width: 393,
    height: 852,
    devicePixelRatio: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    platform: 'iOS'
  },
  {
    id: 'samsung-s23',
    name: 'Samsung S23',
    type: 'mobile',
    width: 360,
    height: 800,
    devicePixelRatio: 3,
    userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36',
    platform: 'Android'
  },
  {
    id: 'ipad-air',
    name: 'iPad Air',
    type: 'tablet',
    width: 820,
    height: 1180,
    devicePixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    platform: 'iOS'
  },
  {
    id: 'ipad-pro',
    name: 'iPad Pro',
    type: 'tablet',
    width: 1024,
    height: 1366,
    devicePixelRatio: 2,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
    platform: 'iOS'
  },
  {
    id: 'responsive',
    name: 'Responsive',
    type: 'desktop',
    width: 1280,
    height: 720,
    devicePixelRatio: 1,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    platform: 'Desktop'
  }
];

interface DeviceEmulatorProps {
  previewUrl?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

export const DeviceEmulator = ({ previewUrl, onLoad, onError }: DeviceEmulatorProps) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('iphone14');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const selectedDevice = devices.find(device => device.id === selectedDeviceId) || devices[0];

  const effectiveWidth = orientation === 'portrait' 
    ? selectedDevice.width 
    : selectedDevice.height;
  
  const effectiveHeight = orientation === 'portrait' 
    ? selectedDevice.height 
    : selectedDevice.width;

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 1500);
    
    return () => clearTimeout(timer);
  }, [previewUrl, selectedDeviceId, orientation]);

  const handleIframeLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleIframeError = () => {
    setIsLoading(false);
    onError?.(new Error('Failed to load preview'));
  };

  const toggleOrientation = () => {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait');
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const resetZoom = () => {
    setZoomLevel(1);
  };

  const renderDeviceFrame = () => {
    const isMobile = selectedDevice.type === 'mobile';
    const isTablet = selectedDevice.type === 'tablet';
    const isDesktop = selectedDevice.type === 'desktop';

    const frameStyle: React.CSSProperties = {
      width: effectiveWidth * zoomLevel,
      height: effectiveHeight * zoomLevel,
      borderRadius: isMobile ? '3rem' : isTablet ? '2rem' : '0.5rem',
      border: isDesktop ? '1px solid #ddd' : '8px solid #1a1a1a',
      backgroundColor: isDesktop ? '#fff' : '#1a1a1a',
      padding: isMobile ? '0.5rem' : isTablet ? '1rem' : '0',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      transformStyle: 'preserve-3d',
      transform: 'perspective(1000px) rotateX(5deg)'
    };

    return (
      <motion.div
        key={`${selectedDeviceId}-${orientation}`}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        style={frameStyle}
        className="relative mx-auto"
      >
        {/* Device Notch for iPhones */}
        {isMobile && selectedDevice.platform === 'iOS' && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-b-xl z-10">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-800 rounded-full"></div>
          </div>
        )}

        {/* Device Screen */}
        <div 
          className="w-full h-full bg-white rounded-lg overflow-hidden relative"
          style={{
            borderTopLeftRadius: isMobile && selectedDevice.platform === 'iOS' ? '2rem' : '0.5rem',
            borderTopRightRadius: isMobile && selectedDevice.platform === 'iOS' ? '2rem' : '0.5rem'
          }}
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
              <div className="flex flex-col items-center gap-2">
                <div className="i-ph:spinner animate-spin text-xl text-gray-400"></div>
                <span className="text-sm text-gray-500">Loading preview...</span>
              </div>
            </div>
          )}

          {previewUrl && (
            <iframe
              ref={iframeRef}
              src={previewUrl}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin allow-forms"
              loading="lazy"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title="Device Preview"
            />
          )}
        </div>

        {/* Home Indicator for iOS */}
        {isMobile && selectedDevice.platform === 'iOS' && (
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gray-600 rounded-full z-10"></div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
      {/* Toolbar */}
      <div className="p-4 border-b border-bolt-elements-borderColor">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">
            Device Emulator
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleOrientation}
              className="p-2 rounded-lg hover:bg-bolt-elements-background-depth-2 transition-colors"
              title="Toggle Orientation"
            >
              <i className={`i-ph:smartphone text-lg ${orientation === 'portrait' ? 'rotate-90' : ''}`}></i>
            </button>
          </div>
        </div>

        {/* Device Selection */}
        <div className="flex flex-wrap gap-2 mb-4">
          {devices.map(device => (
            <button
              key={device.id}
              onClick={() => setSelectedDeviceId(device.id)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-all ${\
                selectedDeviceId === device.id 
                  ? 'bg-bolt-elements-primary text-white' 
                  : 'bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3'
              }`}
            >
              {device.name}
            </button>
          ))}
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg hover:bg-bolt-elements-background-depth-2 transition-colors"
            title="Zoom Out"
          >
            <i className="i-ph:magnifying-glass-minus"></i>
          </button>
          <span className="text-sm text-bolt-elements-textSecondary min-w-[40px] text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg hover:bg-bolt-elements-background-depth-2 transition-colors"
            title="Zoom In"
          >
            <i className="i-ph:magnifying-glass-plus"></i>
          </button>
          <button
            onClick={resetZoom}
            className="p-1.5 rounded-lg hover:bg-bolt-elements-background-depth-2 transition-colors ml-2"
            title="Reset Zoom"
          >
            <i className="i-ph:arrow-counter-clockwise"></i>
          </button>
        </div>
      </div>

      {/* Device Preview */}
      <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-bolt-elements-background-depth-2">
        <AnimatePresence mode="wait">
          {renderDeviceFrame()}
        </AnimatePresence>
      </div>

      {/* Device Info */}
      <div className="p-3 border-t border-bolt-elements-borderColor text-xs text-bolt-elements-textSecondary">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center gap-1">
            <i className="i-ph:size"></i>
            <span>{effectiveWidth} × {effectiveHeight}px</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="i-ph:monitor"></i>
            <span>{orientation}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="i-ph:platform"></i>
            <span>{selectedDevice.platform}</span>
          </div>
          <div className="flex items-center gap-1">
            <i className="i-ph:dots-three"></i>
            <span>Zoom: {Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};