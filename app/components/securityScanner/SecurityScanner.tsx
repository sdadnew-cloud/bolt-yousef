import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createScopedLogger } from '~/utils/logger';
import { securityScannerService, type SecurityVulnerability, type SecurityScanResult } from '~/lib/services/securityScannerService';

const logger = createScopedLogger('SecurityScanner');

interface SecurityScannerProps {
  onScanComplete?: (result: SecurityScanResult) => void;
}

export const SecurityScanner = ({ onScanComplete }: SecurityScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<SecurityScanResult | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const runScan = async () => {
    try {
      setScanning(true);
      setScanResult(null);
      
      logger.info('Starting security scan');
      const result = await securityScannerService.runFullSecurityScan();
      setScanResult(result);
      
      logger.info(`Scan completed: ${result.vulnerabilities.length} vulnerabilities found`);
      onScanComplete?.(result);
    } catch (error) {
      logger.error('Scan failed:', error);
      alert('Security scan failed');
    } finally {
      setScanning(false);
    }
  };

  const getSeverityIcon = (severity: SecurityVulnerability['severity']) => {
    switch (severity) {
      case 'low':
        return 'i-ph:info';
      case 'medium':
        return 'i-ph:warning';
      case 'high':
        return 'i-ph:warning-circle';
      case 'critical':
        return 'i-ph:alert-circle';
    }
  };

  const getSeverityColor = (severity: SecurityVulnerability['severity']) => {
    switch (severity) {
      case 'low':
        return 'text-blue-500';
      case 'medium':
        return 'text-yellow-500';
      case 'high':
        return 'text-orange-500';
      case 'critical':
        return 'text-red-500';
    }
  };

  const getCategoryIcon = (category: SecurityVulnerability['category']) => {
    switch (category) {
      case 'dependency':
        return 'i-ph:package';
      case 'code':
        return 'i-ph:code';
      case 'configuration':
        return 'i-ph:settings';
      case 'secret':
        return 'i-ph:eye';
    }
  };

  const getCategoryColor = (category: SecurityVulnerability['category']) => {
    switch (category) {
      case 'dependency':
        return 'text-purple-500';
      case 'code':
        return 'text-green-500';
      case 'configuration':
        return 'text-blue-500';
      case 'secret':
        return 'text-red-500';
    }
  };

  const filteredVulnerabilities = filter === 'all'
    ? scanResult?.vulnerabilities || []
    : scanResult?.vulnerabilities.filter(vuln => (
        (filter === 'high' && (vuln.severity === 'high' || vuln.severity === 'critical')) ||
        (filter === 'medium' && vuln.severity === 'medium') ||
        (filter === 'low' && vuln.severity === 'low')
      )) || [];

  return (
    <div className="flex flex-col h-full bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
      {/* Header */}
      <div className="p-4 border-b border-bolt-elements-borderColor">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">
            Security Scanner
          </h3>
          <button
            onClick={runScan}
            disabled={scanning}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              scanning 
                ? 'bg-gray-500 text-white cursor-not-allowed' 
                : 'bg-bolt-elements-primary text-white hover:bg-bolt-elements-primary/90'
            }`}
          >
            {scanning ? (
              <>
                <i className="i-ph:spinner animate-spin mr-1"></i>
                Scanning...
              </>
            ) : (
              <>
                <i className="i-ph:shield mr-1"></i>
                Scan Now
              </>
            )}
          </button>
        </div>

        {/* Scan Statistics */}
        {scanResult && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-2 bg-bolt-elements-background-depth-2 rounded-lg">
              <div className="flex items-center gap-2">
                <i className="i-ph:shield text-blue-500"></i>
                <span className="text-bolt-elements-textSecondary">Total</span>
              </div>
              <div className="text-lg font-semibold text-bolt-elements-textPrimary">
                {scanResult.vulnerabilities.length}
              </div>
            </div>
            <div className="p-2 bg-bolt-elements-background-depth-2 rounded-lg">
              <div className="flex items-center gap-2">
                <i className="i-ph:alert-circle text-red-500"></i>
                <span className="text-bolt-elements-textSecondary">Critical</span>
              </div>
              <div className="text-lg font-semibold text-bolt-elements-textPrimary">
                {scanResult.statistics.critical}
              </div>
            </div>
            <div className="p-2 bg-bolt-elements-background-depth-2 rounded-lg">
              <div className="flex items-center gap-2">
                <i className="i-ph:warning-circle text-orange-500"></i>
                <span className="text-bolt-elements-textSecondary">High</span>
              </div>
              <div className="text-lg font-semibold text-bolt-elements-textPrimary">
                {scanResult.statistics.high}
              </div>
            </div>
            <div className="p-2 bg-bolt-elements-background-depth-2 rounded-lg">
              <div className="flex items-center gap-2">
                <i className="i-ph:warning text-yellow-500"></i>
                <span className="text-bolt-elements-textSecondary">Medium</span>
              </div>
              <div className="text-lg font-semibold text-bolt-elements-textPrimary">
                {scanResult.statistics.medium}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter */}
      {scanResult && (
        <div className="p-3 border-b border-bolt-elements-borderColor">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-bolt-elements-primary text-white' 
                  : 'bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('high')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'high' 
                  ? 'bg-bolt-elements-primary text-white' 
                  : 'bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3'
              }`}
            >
              High/Critical
            </button>
            <button
              onClick={() => setFilter('medium')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'medium' 
                  ? 'bg-bolt-elements-primary text-white' 
                  : 'bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3'
              }`}
            >
              Medium
            </button>
            <button
              onClick={() => setFilter('low')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'low' 
                  ? 'bg-bolt-elements-primary text-white' 
                  : 'bg-bolt-elements-background-depth-2 hover:bg-bolt-elements-background-depth-3'
              }`}
            >
              Low
            </button>
          </div>
        </div>
      )}

      {/* Vulnerabilities List */}
      <div className="flex-1 overflow-auto p-4">
        {scanning ? (
          <div className="flex items-center justify-center h-full text-bolt-elements-textSecondary">
            <div className="flex flex-col items-center gap-2">
              <i className="i-ph:spinner animate-spin text-2xl"></i>
              <span>Scanning for vulnerabilities...</span>
            </div>
          </div>
        ) : !scanResult ? (
          <div className="text-center py-8 text-bolt-elements-textTertiary">
            <i className="i-ph:shield text-4xl mb-2"></i>
            <p>No scan performed yet</p>
            <p className="text-sm mt-1">Click "Scan Now" to check for vulnerabilities</p>
          </div>
        ) : filteredVulnerabilities.length === 0 ? (
          <div className="text-center py-8 text-bolt-elements-textTertiary">
            <i className="i-ph:check-circle text-4xl mb-2 text-green-500"></i>
            <p>No vulnerabilities found</p>
            <p className="text-sm mt-1">Your codebase is clean</p>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filteredVulnerabilities.map((vuln, index) => (
                <motion.div
                  key={`${vuln.id}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-3 bg-bolt-elements-background-depth-2 rounded-lg border border-bolt-elements-borderColor hover:border-bolt-elements-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <i className={`${getSeverityIcon(vuln.severity)} ${getSeverityColor(vuln.severity)}`}></i>
                        <h4 className="font-medium text-bolt-elements-textPrimary">{vuln.title}</h4>
                        <i className={`${getCategoryIcon(vuln.category)} ${getCategoryColor(vuln.category)} text-sm`} 
                           title={vuln.category}></i>
                      </div>
                      <p className="text-sm text-bolt-elements-textSecondary mb-2">{vuln.description}</p>
                      {vuln.location && (
                        <div className="flex items-center gap-1 text-xs text-bolt-elements-textSecondary mb-1">
                          <i className="i-ph:file"></i>
                          <span>{vuln.location}{vuln.line ? `:${vuln.line}` : ''}</span>
                        </div>
                      )}
                      {vuln.fix && (
                        <div className="flex items-start gap-1 text-xs text-green-500 bg-green-50 p-1.5 rounded">
                          <i className="i-ph:wrench mt-0.5"></i>
                          <span>{vuln.fix}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        vuln.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        vuln.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        vuln.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {vuln.severity}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer */}
      {scanResult && (
        <div className="p-3 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
          <div className="flex items-center justify-between text-xs text-bolt-elements-textSecondary">
            <span>Showing {filteredVulnerabilities.length} of {scanResult.vulnerabilities.length} vulnerabilities</span>
            <span>Scan time: {scanResult.scanTime}ms</span>
          </div>
        </div>
      )}
    </div>
  );
};