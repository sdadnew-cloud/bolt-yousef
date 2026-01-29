import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { classNames } from '~/utils/classNames';
import { useStore } from '@nanostores/react';
import { themeStore } from '~/lib/stores/theme';
import { dependencyAwarenessService } from '~/lib/services/dependencyAwarenessService';
import { staticAnalysisService } from '~/lib/services/staticAnalysisService';
import { securityScannerService } from '~/lib/services/securityScannerService';
import { nicheAgentsService } from '~/lib/services/nicheAgentsService';

const UpgradesTab = () => {
  const theme = useStore(themeStore);
  const [updateCheckStatus, setUpdateCheckStatus] = useState<'idle' | 'checking' | 'available' | 'up_to_date'>('idle');
  const [availableUpdates, setAvailableUpdates] = useState<any[]>([]);
  const [scanResults, setScanResults] = useState<any>(null);
  const [dependencyStatus, setDependencyStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check for updates
  const checkForUpdates = async () => {
    setIsLoading(true);
    setUpdateCheckStatus('checking');
    
    try {
      // Simulate checking for updates
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock available updates - in a real implementation, this would come from an API
      const mockUpdates = [
        { id: 1, name: 'AI Pair Programmer', version: '1.2.4', type: 'feature', description: 'Enhanced reasoning visualization' },
        { id: 2, name: 'Security Scanner', version: '2.1.0', type: 'security', description: 'Advanced vulnerability detection' },
        { id: 3, name: 'Dependency Awareness', version: '1.5.1', type: 'improvement', description: 'Improved dependency analysis' },
        { id: 4, name: 'Static Analysis', version: '1.3.2', type: 'tooling', description: 'Enhanced ESLint integration' }
      ];
      
      if (mockUpdates.length > 0) {
        setAvailableUpdates(mockUpdates);
        setUpdateCheckStatus('available');
        toast.info(`Found ${mockUpdates.length} updates available`);
      } else {
        setUpdateCheckStatus('up_to_date');
        toast.success('All components are up to date!');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      toast.error('Failed to check for updates');
    } finally {
      setIsLoading(false);
    }
  };

  // Run dependency scan
  const runDependencyScan = async () => {
    setIsLoading(true);
    try {
      const results = await dependencyAwarenessService.scanPackageJson();
      setDependencyStatus(results);
      toast.success('Dependency scan completed');
    } catch (error) {
      console.error('Dependency scan error:', error);
      toast.error('Failed to run dependency scan');
    } finally {
      setIsLoading(false);
    }
  };

  // Run security scan
  const runSecurityScan = async () => {
    setIsLoading(true);
    try {
      const results = await securityScannerService.runFullSecurityScan();
      setScanResults(results);
      toast.success('Security scan completed');
    } catch (error) {
      console.error('Security scan error:', error);
      toast.error('Failed to run security scan');
    } finally {
      setIsLoading(false);
    }
  };

  // Run static analysis
  const runStaticAnalysis = async () => {
    setIsLoading(true);
    try {
      const results = await staticAnalysisService.runFullAnalysis();
      toast.success('Static analysis completed');
    } catch (error) {
      console.error('Static analysis error:', error);
      toast.error('Failed to run static analysis');
    } finally {
      setIsLoading(false);
    }
  };

  // Install updates
  const installUpdates = async () => {
    setIsLoading(true);
    try {
      // Simulate update installation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setUpdateCheckStatus('up_to_date');
      setAvailableUpdates([]);
      toast.success('Updates installed successfully');
    } catch (error) {
      console.error('Update installation error:', error);
      toast.error('Failed to install updates');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'security':
        return 'text-red-500 bg-red-500/10';
      case 'feature':
        return 'text-blue-500 bg-blue-500/10';
      case 'improvement':
        return 'text-purple-500 bg-purple-500/10';
      case 'tooling':
        return 'text-green-500 bg-green-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-xl font-semibold text-bolt-elements-textPrimary mb-2">Platform Upgrades</h2>
        <p className="text-bolt-elements-textSecondary">
          Check for and install updates to enhance your development environment
        </p>
      </div>

      {/* Update Status Card */}
      <motion.div
        className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-[#0A0A0A] border-[#1A1A1A]' 
            : 'bg-white border-[#E5E5E5]'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-bolt-elements-textPrimary">System Updates</h3>
            <p className="text-sm text-bolt-elements-textSecondary">
              {updateCheckStatus === 'idle' 
                ? 'Check for available updates' 
                : updateCheckStatus === 'checking' 
                  ? 'Checking for updates...' 
                  : updateCheckStatus === 'available' 
                    ? `Found ${availableUpdates.length} updates` 
                    : 'All systems up to date'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={checkForUpdates}
              disabled={updateCheckStatus === 'checking' || isLoading}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                updateCheckStatus === 'checking' || isLoading
                  ? 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                  : 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20'
              }`}
            >
              {updateCheckStatus === 'checking' ? 'Checking...' : 'Check Updates'}
            </button>
            
            {updateCheckStatus === 'available' && (
              <button
                onClick={installUpdates}
                disabled={isLoading}
                className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
              >
                Install All
              </button>
            )}
          </div>
        </div>

        {availableUpdates.length > 0 && (
          <div className="mt-4 space-y-2">
            {availableUpdates.map((update) => (
              <div 
                key={update.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-[#FAFAFA]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(update.type)}`}>
                    {update.type}
                  </div>
                  <div>
                    <div className="font-medium text-bolt-elements-textPrimary">{update.name}</div>
                    <div className="text-xs text-bolt-elements-textSecondary">{update.description}</div>
                  </div>
                </div>
                <div className="text-sm text-bolt-elements-textSecondary">v{update.version}</div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-[#0A0A0A] border-[#1A1A1A]' 
              : 'bg-white border-[#E5E5E5]'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="i-ph:package text-purple-500" />
            <h3 className="font-medium text-bolt-elements-textPrimary">Dependency Scan</h3>
          </div>
          <p className="text-sm text-bolt-elements-textSecondary mb-3">
            Check for outdated and vulnerable dependencies
          </p>
          <button
            onClick={runDependencyScan}
            disabled={isLoading}
            className="w-full py-2 px-3 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50"
          >
            Run Scan
          </button>
        </motion.div>

        <motion.div
          className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-[#0A0A0A] border-[#1A1A1A]' 
              : 'bg-white border-[#E5E5E5]'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="i-ph:shield-check text-green-500" />
            <h3 className="font-medium text-bolt-elements-textPrimary">Security Scan</h3>
          </div>
          <p className="text-sm text-bolt-elements-textSecondary mb-3">
            Analyze code for security vulnerabilities
          </p>
          <button
            onClick={runSecurityScan}
            disabled={isLoading}
            className="w-full py-2 px-3 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            Run Scan
          </button>
        </motion.div>

        <motion.div
          className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-[#0A0A0A] border-[#1A1A1A]' 
              : 'bg-white border-[#E5E5E5]'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="i-ph:code text-blue-500" />
            <h3 className="font-medium text-bolt-elements-textPrimary">Static Analysis</h3>
          </div>
          <p className="text-sm text-bolt-elements-textSecondary mb-3">
            Analyze code quality and style issues
          </p>
          <button
            onClick={runStaticAnalysis}
            disabled={isLoading}
            className="w-full py-2 px-3 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Run Analysis
          </button>
        </motion.div>
      </div>

      {/* Scan Results */}
      {(dependencyStatus || scanResults) && (
        <motion.div
          className={`p-4 rounded-lg border ${
            theme === 'dark' 
              ? 'bg-[#0A0A0A] border-[#1A1A1A]' 
              : 'bg-white border-[#E5E5E5]'
          }`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-medium text-bolt-elements-textPrimary mb-3">Scan Results</h3>
          
          {dependencyStatus && (
            <div className="mb-4">
              <h4 className="font-medium text-bolt-elements-textSecondary mb-2">Dependency Analysis</h4>
              <div className="space-y-2">
                {dependencyStatus.dependencies && (
                  <div className="text-sm">
                    <div className="text-bolt-elements-textPrimary">Dependencies: {dependencyStatus.dependencies.length}</div>
                    {dependencyStatus.dependencies.some((dep: any) => dep.outdated) && (
                      <div className="text-yellow-500">Outdated dependencies detected</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {scanResults && (
            <div>
              <h4 className="font-medium text-bolt-elements-textSecondary mb-2">Security Results</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-bolt-elements-textPrimary">Critical: {scanResults.critical || 0}</div>
                  <div className="text-red-500">High: {scanResults.high || 0}</div>
                </div>
                <div>
                  <div className="text-yellow-500">Medium: {scanResults.medium || 0}</div>
                  <div className="text-orange-500">Low: {scanResults.low || 0}</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Niche Agents Status */}
      <motion.div
        className={`p-4 rounded-lg border ${
          theme === 'dark' 
            ? 'bg-[#0A0A0A] border-[#1A1A1A]' 
            : 'bg-white border-[#E5E5E5]'
        }`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="i-ph:users-three text-indigo-500" />
          <h3 className="font-medium text-bolt-elements-textPrimary">Niche Agents</h3>
        </div>
        <p className="text-sm text-bolt-elements-textSecondary mb-3">
          Specialized AI agents for different development tasks
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {nicheAgentsService.getAgents().slice(0, 4).map((agent) => (
            <div 
              key={agent.id}
              className={`p-2 rounded text-center ${
                theme === 'dark' ? 'bg-[#1A1A1A]' : 'bg-[#FAFAFA]'
              }`}
            >
              <div className="text-xs font-medium text-bolt-elements-textPrimary truncate">{agent.name}</div>
              <div className="text-xs text-bolt-elements-textSecondary">{agent.role}</div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default UpgradesTab;