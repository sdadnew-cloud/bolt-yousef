import { createScopedLogger } from '~/utils/logger';
import { webcontainer } from '~/lib/webcontainer';

const logger = createScopedLogger('DependencyAwareness');

export interface DependencyInfo {
  name: string;
  version: string;
  latestVersion?: string;
  isOutdated?: boolean;
  deprecated?: boolean;
  deprecatedAPIs?: string[];
  vulnerabilities?: string[];
}

export interface PackageJsonInfo {
  name: string;
  version: string;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export class DependencyAwarenessService {
  private static _instance: DependencyAwarenessService;

  static getInstance(): DependencyAwarenessService {
    if (!DependencyAwarenessService._instance) {
      DependencyAwarenessService._instance = new DependencyAwarenessService();
    }

    return DependencyAwarenessService._instance;
  }

  /**
   * Scan package.json file and analyze dependencies
   */
  async scanPackageJson(): Promise<PackageJsonInfo | null> {
    try {
      const wc = await webcontainer;
      const packageJsonPath = 'package.json';

      const packageJsonContent = await wc.fs.readFile(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);

      logger.info('Package.json scanned successfully');

      return packageJson;
    } catch (error) {
      logger.error('Failed to scan package.json:', error);
      return null;
    }
  }

  /**
   * Check for outdated dependencies
   */
  async checkForOutdatedDependencies(): Promise<DependencyInfo[]> {
    try {
      const wc = await webcontainer;

      // Run npm outdated to check for updates
      const process = await wc.spawn('npm', ['outdated', '--json']);

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
        try {
          const outdatedDependencies = JSON.parse(output);
          return Object.entries(outdatedDependencies).map(([name, info]: [string, any]) => ({
            name,
            version: info.current,
            latestVersion: info.latest,
            isOutdated: info.current !== info.latest,
            deprecated: info.deprecated === true,
          }));
        } catch (parseError) {
          logger.error('Failed to parse npm outdated output:', parseError);
        }
      }

      return [];
    } catch (error) {
      logger.error('Failed to check for outdated dependencies:', error);
      return [];
    }
  }

  /**
   * Check for vulnerable dependencies using npm audit
   */
  async checkForVulnerabilities(): Promise<DependencyInfo[]> {
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
        try {
          const auditReport = JSON.parse(output);

          if (auditReport.vulnerabilities) {
            return Object.entries(auditReport.vulnerabilities).map(([name, info]: [string, any]) => ({
              name,
              version: info.version,
              vulnerabilities: info.advisories.map((adv: any) => adv.title),
            }));
          }
        } catch (parseError) {
          logger.error('Failed to parse npm audit output:', parseError);
        }
      }

      return [];
    } catch (error) {
      logger.error('Failed to check for vulnerabilities:', error);
      return [];
    }
  }

  /**
   * Get dependency awareness context for LLM
   */
  async getDependencyContext(): Promise<string> {
    const packageJson = await this.scanPackageJson();

    if (!packageJson) {
      return 'No package.json file found in the project.';
    }

    const outdatedDependencies = await this.checkForOutdatedDependencies();
    const vulnerableDependencies = await this.checkForVulnerabilities();

    let context = 'Project Dependencies Information:\n\n';
    context += `Project: ${packageJson.name || 'Unknown'} v${packageJson.version || 'Unknown'}\n\n`;

    if (packageJson.dependencies) {
      context += 'Dependencies:\n';
      Object.entries(packageJson.dependencies).forEach(([name, version]) => {
        const outdatedInfo = outdatedDependencies.find((dep) => dep.name === name);
        const vulnerableInfo = vulnerableDependencies.find((dep) => dep.name === name);
        const status = [];

        if (outdatedInfo?.isOutdated) {
          status.push(`❌ Outdated (current: ${version}, latest: ${outdatedInfo.latestVersion})`);
        }

        if (vulnerableInfo?.vulnerabilities?.length > 0) {
          status.push(`⚠️ Vulnerable (${vulnerableInfo.vulnerabilities.length} issues)`);
        }

        if (outdatedInfo?.deprecated) {
          status.push('🚨 Deprecated');
        }

        context += `- ${name}@${version}${status.length > 0 ? ` [${status.join(', ')}]` : ''}\n`;
      });
    }

    if (packageJson.devDependencies) {
      context += '\nDev Dependencies:\n';
      Object.entries(packageJson.devDependencies).forEach(([name, version]) => {
        const outdatedInfo = outdatedDependencies.find((dep) => dep.name === name);
        const vulnerableInfo = vulnerableDependencies.find((dep) => dep.name === name);
        const status = [];

        if (outdatedInfo?.isOutdated) {
          status.push(`❌ Outdated (current: ${version}, latest: ${outdatedInfo.latestVersion})`);
        }

        if (vulnerableInfo?.vulnerabilities?.length > 0) {
          status.push(`⚠️ Vulnerable (${vulnerableInfo.vulnerabilities.length} issues)`);
        }

        if (outdatedInfo?.deprecated) {
          status.push('🚨 Deprecated');
        }

        context += `- ${name}@${version}${status.length > 0 ? ` [${status.join(', ')}]` : ''}\n`;
      });
    }

    if (outdatedDependencies.length > 0) {
      context += `\nWarning: ${outdatedDependencies.length} dependencies are outdated.`;
    }

    if (vulnerableDependencies.length > 0) {
      context += `\nSecurity Alert: ${vulnerableDependencies.length} dependencies have known vulnerabilities.`;
    }

    context += '\n\nImportant Notes:\n';
    context += '- Do NOT suggest using deprecated APIs or outdated library versions\n';
    context += '- If using React, ensure compatibility with the version specified in package.json\n';
    context += '- For TypeScript projects, consider type definitions compatibility\n';
    context += '- Always verify compatibility with the existing tech stack before suggesting changes\n';

    return context;
  }

  /**
   * Check if a specific API is deprecated in the current dependencies
   */
  async isAPIDeprecated(apiName: string, libraryName?: string): Promise<boolean> {
    /*
     * This is a simplified version - in a real implementation,
     * this would check against a database of deprecated APIs per library version
     */

    const deprecatedAPIs = {
      react: {
        '18.x': ['ReactDOM.render', 'ReactDOM.hydrate', 'React.createFactory'],
        '17.x': ['React.StrictMode', 'React.Fragment'],
      },
      express: {
        '4.x': ['express.static.mime', 'res.sendfile', 'res.jsonp'],
      },
    };

    const packageJson = await this.scanPackageJson();

    if (!packageJson) {
      return false;
    }

    const libraries = libraryName
      ? [libraryName]
      : Object.keys({
          ...packageJson.dependencies,
          ...packageJson.devDependencies,
        });

    for (const lib of libraries) {
      if (deprecatedAPIs[lib]) {
        const version = packageJson.dependencies[lib] || packageJson.devDependencies[lib];
        const versionMajor = version.match(/^(\d+)/)?.[1];

        if (versionMajor && deprecatedAPIs[lib][`${versionMajor}.x`]) {
          const apiList = deprecatedAPIs[lib][`${versionMajor}.x`];

          if (apiList.some((api) => apiName.includes(api) || api.includes(apiName))) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Get compatibility warnings for the current dependencies
   */
  async getCompatibilityWarnings(): Promise<string[]> {
    const warnings: string[] = [];
    const packageJson = await this.scanPackageJson();

    if (!packageJson) {
      return warnings;
    }

    // Check React version compatibility
    if (packageJson.dependencies?.react) {
      const reactVersion = packageJson.dependencies.react;

      if (reactVersion.startsWith('16.')) {
        warnings.push('React 16.x is outdated. Consider upgrading to React 18.x for better performance and features.');
      }
    }

    // Check TypeScript compatibility
    if (packageJson.devDependencies?.typescript) {
      const tsVersion = packageJson.devDependencies.typescript;

      if (tsVersion.startsWith('3.')) {
        warnings.push('TypeScript 3.x is outdated. Upgrading to TypeScript 5.x is recommended.');
      }
    }

    // Check Node.js compatibility
    if (packageJson.engines?.node) {
      const nodeVersion = packageJson.engines.node;

      if (nodeVersion.includes('14.') || nodeVersion.includes('16.')) {
        warnings.push('Node.js version in engines is outdated. Consider using Node.js 20.x or later.');
      }
    }

    return warnings;
  }
}

export const dependencyAwarenessService = DependencyAwarenessService.getInstance();
