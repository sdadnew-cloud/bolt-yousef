import { createScopedLogger } from '~/utils/logger';
import { webcontainer } from '~/lib/webcontainer';

const logger = createScopedLogger('SecurityScanner');

export interface SecurityVulnerability {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'dependency' | 'code' | 'configuration' | 'secret';
  location?: string;
  line?: number;
  column?: number;
  fix?: string;
  references?: string[];
}

export interface SecurityScanResult {
  vulnerabilities: SecurityVulnerability[];
  scanTime: number;
  totalFilesScanned: number;
  vulnerableFiles: number;
  statistics: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export class SecurityScannerService {
  private static _instance: SecurityScannerService;

  static getInstance(): SecurityScannerService {
    if (!SecurityScannerService._instance) {
      SecurityScannerService._instance = new SecurityScannerService();
    }
    return SecurityScannerService._instance;
  }

  /**
   * Run comprehensive security scan on the project
   */
  async runFullSecurityScan(): Promise<SecurityScanResult> {
    const startTime = Date.now();
    logger.info('Starting comprehensive security scan...');

    const vulnerabilities: SecurityVulnerability[] = [];
    let totalFilesScanned = 0;
    let vulnerableFiles = 0;

    // Run dependency vulnerability scan
    const dependencyVulnerabilities = await this.scanDependencies();
    vulnerabilities.push(...dependencyVulnerabilities);

    // Run secret detection
    const secretVulnerabilities = await this.scanForSecrets();
    vulnerabilities.push(...secretVulnerabilities);

    // Run code vulnerability scan
    const codeVulnerabilities = await this.scanCode();
    vulnerabilities.push(...codeVulnerabilities);

    // Run configuration scan
    const configVulnerabilities = await this.scanConfiguration();
    vulnerabilities.push(...configVulnerabilities);

    const scanTime = Date.now() - startTime;
    
    logger.info(`Security scan completed in ${scanTime}ms`);
    logger.info(`Found ${vulnerabilities.length} vulnerabilities: ${vulnerabilities.filter(v => v.severity === 'critical').length} critical, ${vulnerabilities.filter(v => v.severity === 'high').length} high, ${vulnerabilities.filter(v => v.severity === 'medium').length} medium, ${vulnerabilities.filter(v => v.severity === 'low').length} low`);

    return {
      vulnerabilities,
      scanTime,
      totalFilesScanned,
      vulnerableFiles,
      statistics: {
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length
      }
    };
  }

  /**
   * Scan for dependency vulnerabilities using npm audit
   */
  async scanDependencies(): Promise<SecurityVulnerability[]> {
    try {
      const wc = await webcontainer;
      
      const process = await wc.spawn('npm', ['audit', '--json']);
      
      let output = '';
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data;
          },
        }),
      );
      
      await process.exit;
      
      if (output) {
        const auditReport = JSON.parse(output);
        if (auditReport.vulnerabilities) {
          return Object.entries(auditReport.vulnerabilities).map(([name, info]: [string, any]) => ({
            id: `dep-${name}-${info.version}`,
            title: `${name}@${info.version}`,
            description: info.title,
            severity: this._mapNpmSeverity(info.severity),
            category: 'dependency',
            fix: info.fixAvailable ? 'Update to latest version' : 'No fix available',
            references: info.advisories.map((adv: any) => adv.url)
          }));
        }
      }
      
      return [];
    } catch (error) {
      logger.error('Dependency scan failed:', error);
      return [];
    }
  }

  /**
   * Scan for secrets in codebase
   */
  async scanForSecrets(): Promise<SecurityVulnerability[]> {
    const secretsPatterns = [
      {
        pattern: /(?:^|\W)API_KEY\s*[=:]\s*['"]([a-zA-Z0-9_-]{16,})['"](?:$|\W)/,
        name: 'API Key',
        severity: 'high'
      },
      {
        pattern: /(?:^|\W)API_TOKEN\s*[=:]\s*['"]([a-zA-Z0-9_-]{16,})['"](?:$|\W)/,
        name: 'API Token',
        severity: 'high'
      },
      {
        pattern: /(?:^|\W)SECRET\s*[=:]\s*['"]([a-zA-Z0-9_-]{16,})['"](?:$|\W)/,
        name: 'Secret',
        severity: 'high'
      },
      {
        pattern: /(?:^|\W)PASSWORD\s*[=:]\s*['"]([^\s'"]{8,})['"](?:$|\W)/,
        name: 'Password',
        severity: 'critical'
      },
      {
        pattern: /(?:^|\W)PRIVATE_KEY\s*[=:]\s*['"]([a-zA-Z0-9+/=]{64,})['"](?:$|\W)/,
        name: 'Private Key',
        severity: 'critical'
      },
      {
        pattern: /(?:^|\W)AWS_ACCESS_KEY_ID\s*[=:]\s*['"]([A-Z0-9]{16,})['"](?:$|\W)/,
        name: 'AWS Access Key',
        severity: 'critical'
      },
      {
        pattern: /(?:^|\W)AWS_SECRET_ACCESS_KEY\s*[=:]\s*['"]([a-zA-Z0-9+/=]{40,})['"](?:$|\W)/,
        name: 'AWS Secret Key',
        severity: 'critical'
      },
      {
        pattern: /(?:^|\W)GITHUB_TOKEN\s*[=:]\s*['"]([a-zA-Z0-9_]{40,})['"](?:$|\W)/,
        name: 'GitHub Token',
        severity: 'high'
      }
    ];

    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const wc = await webcontainer;
      const files = await this._getAllSourceFiles();

      for (const filePath of files) {
        try {
          const content = await wc.fs.readFile(filePath, 'utf-8');
          
          for (const { pattern, name, severity } of secretsPatterns) {
            const matches = content.matchAll(pattern);
            
            for (const match of matches) {
              vulnerabilities.push({
                id: `secret-${name}-${filePath}-${match.index}`,
                title: `${name} Exposure`,
                description: `Potential ${name.toLowerCase()} exposure detected in ${filePath}`,
                severity: severity as any,
                category: 'secret',
                location: filePath,
                line: this._getLineNumber(content, match.index || 0),
                fix: 'Remove or mask sensitive information'
              });
            }
          }
        } catch (error) {
          logger.error(`Failed to scan file ${filePath}:`, error);
        }
      }
    } catch (error) {
      logger.error('Secret detection failed:', error);
    }

    return vulnerabilities;
  }

  /**
   * Scan for code vulnerabilities
   */
  async scanCode(): Promise<SecurityVulnerability[]> {
    const codePatterns = [
      {
        pattern: /eval\s*\(/,
        name: 'Eval Usage',
        severity: 'high',
        description: 'Use of eval() function which can lead to code injection vulnerabilities'
      },
      {
        pattern: /document\.write\s*\(/,
        name: 'Document Write',
        severity: 'medium',
        description: 'Use of document.write() which can lead to XSS vulnerabilities'
      },
      {
        pattern: /innerHTML\s*[=]/,
        name: 'InnerHTML Assignment',
        severity: 'medium',
        description: 'Direct assignment to innerHTML which can lead to XSS vulnerabilities'
      },
      {
        pattern: /(?:^|\W)dangerouslySetInnerHTML\s*[=]/,
        name: 'Dangerously Set InnerHTML',
        severity: 'high',
        description: 'Use of dangerouslySetInnerHTML which can lead to XSS vulnerabilities'
      },
      {
        pattern: /(?:^|\W)localStorage\s*\[/,
        name: 'LocalStorage Usage',
        severity: 'low',
        description: 'Use of localStorage which may expose sensitive data'
      },
      {
        pattern: /(?:^|\W)sessionStorage\s*\[/,
        name: 'SessionStorage Usage',
        severity: 'low',
        description: 'Use of sessionStorage which may expose sensitive data'
      },
      {
        pattern: /(?:^|\W)fetch\s*\([^)]*['"][^'"]*password['"][^)]*\)/,
        name: 'Password in Fetch',
        severity: 'high',
        description: 'Password parameter detected in fetch request'
      }
    ];

    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const wc = await webcontainer;
      const files = await this._getAllSourceFiles(['.js', '.ts', '.jsx', '.tsx']);

      for (const filePath of files) {
        try {
          const content = await wc.fs.readFile(filePath, 'utf-8');
          
          for (const { pattern, name, severity, description } of codePatterns) {
            const matches = content.matchAll(pattern);
            
            for (const match of matches) {
              vulnerabilities.push({
                id: `code-${name}-${filePath}-${match.index}`,
                title: name,
                description,
                severity: severity as any,
                category: 'code',
                location: filePath,
                line: this._getLineNumber(content, match.index || 0)
              });
            }
          }
        } catch (error) {
          logger.error(`Failed to scan file ${filePath}:`, error);
        }
      }
    } catch (error) {
      logger.error('Code vulnerability scan failed:', error);
    }

    return vulnerabilities;
  }

  /**
   * Scan for configuration vulnerabilities
   */
  async scanConfiguration(): Promise<SecurityVulnerability[]> {
    const vulnerabilities: SecurityVulnerability[] = [];

    try {
      const wc = await webcontainer;
      
      // Check if .env files exist and contain sensitive information
      try {
        const envContent = await wc.fs.readFile('.env', 'utf-8');
        const envPatterns = [
          { pattern: /(?:^|\W)NODE_ENV\s*=\s*['"]?development['"]?/i, name: 'Development Mode' },
          { pattern: /(?:^|\W)DEBUG\s*=\s*['"]?true['"]?/i, name: 'Debug Mode' },
          { pattern: /(?:^|\W)CORS\s*=\s*['"]?\*/i, name: 'Wildcard CORS' },
          { pattern: /(?:^|\W)ALLOWED_ORIGINS\s*=\s*['"]?\*/i, name: 'Wildcard Origins' }
        ];

        for (const { pattern, name } of envPatterns) {
          if (pattern.test(envContent)) {
            vulnerabilities.push({
              id: `config-${name.toLowerCase()}`,
              title: `${name} Configuration`,
              description: `${name} configuration detected which may be insecure in production`,
              severity: 'medium',
              category: 'configuration',
              location: '.env'
            });
          }
        }
      } catch {
        // .env file not found, skip
      }

      // Check package.json for insecure dependencies
      try {
        const packageJsonContent = await wc.fs.readFile('package.json', 'utf-8');
        const packageJson = JSON.parse(packageJsonContent);
        
        // Check for deprecated dependencies
        const deprecatedDependencies = Object.keys({
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        }).filter(name => {
          return name.includes('deprecated') || name.includes('obsolete');
        });

        for (const dep of deprecatedDependencies) {
          vulnerabilities.push({
            id: `config-deprecated-${dep}`,
            title: `Deprecated Dependency: ${dep}`,
            description: `Dependency ${dep} is deprecated and may contain security vulnerabilities`,
            severity: 'medium',
            category: 'configuration',
            location: 'package.json'
          });
        }
      } catch (error) {
        logger.error('Failed to parse package.json:', error);
      }
    } catch (error) {
      logger.error('Configuration scan failed:', error);
    }

    return vulnerabilities;
  }

  /**
   * Get all source files to scan
   */
  private async _getAllSourceFiles(extensions: string[] = ['.js', '.ts', '.jsx', '.tsx', '.json']): Promise<string[]> {
    const wc = await webcontainer;
    const files: string[] = [];

    const walk = async (dir: string): Promise<void> => {
      const entries = await wc.fs.readdir(dir);
      
      for (const entry of entries) {
        const fullPath = `${dir}/${entry}`;
        
        // Skip node_modules and other directories
        if (entry === 'node_modules' || entry === '.git' || entry.startsWith('.')) {
          continue;
        }

        const stat = await wc.fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          await walk(fullPath);
        } else if (extensions.some(ext => entry.endsWith(ext))) {
          files.push(fullPath);
        }
      }
    };

    await walk('.');
    return files;
  }

  /**
   * Convert npm severity to our severity levels
   */
  private _mapNpmSeverity(npmSeverity: string): 'low' | 'medium' | 'high' | 'critical' {
    const severityMap: Record<string, 'low' | 'medium' | 'high' | 'critical'> = {
      low: 'low',
      moderate: 'medium',
      high: 'high',
      critical: 'critical'
    };

    return severityMap[npmSeverity] || 'medium';
  }

  /**
   * Get line number from content and index
   */
  private _getLineNumber(content: string, index: number): number {
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Generate security scan report
   */
  generateSecurityReport(scanResult: SecurityScanResult): string {
    let report = `Security Scan Report\n`;
    report += `==================\n\n`;
    report += `Scan Time: ${scanResult.scanTime}ms\n`;
    report += `Files Scanned: ${scanResult.totalFilesScanned}\n`;
    report += `Vulnerable Files: ${scanResult.vulnerableFiles}\n`;
    report += `Total Vulnerabilities: ${scanResult.vulnerabilities.length}\n`;
    report += `  Critical: ${scanResult.statistics.critical}\n`;
    report += `  High: ${scanResult.statistics.high}\n`;
    report += `  Medium: ${scanResult.statistics.medium}\n`;
    report += `  Low: ${scanResult.statistics.low}\n\n`;

    if (scanResult.vulnerabilities.length > 0) {
      report += `Vulnerabilities:\n`;
      report += `----------------\n\n`;

      scanResult.vulnerabilities.forEach((vuln, index) => {
        report += `${index + 1}. ${vuln.title} (${vuln.severity})\n`;
        report += `   ${vuln.description}\n`;
        
        if (vuln.location) {
          report += `   Location: ${vuln.location}${vuln.line ? `:${vuln.line}` : ''}\n`;
        }
        
        if (vuln.fix) {
          report += `   Fix: ${vuln.fix}\n`;
        }
        
        report += `\n`;
      });
    }

    return report;
  }

  /**
   * Priority-based fix recommendations
   */
  getFixRecommendations(scanResult: SecurityScanResult): SecurityVulnerability[] {
    return [...scanResult.vulnerabilities].sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    }).slice(0, 10); // Top 10 most critical vulnerabilities
  }
}

export const securityScannerService = SecurityScannerService.getInstance();