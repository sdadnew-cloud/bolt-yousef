import { createScopedLogger } from '~/utils/logger';
import { webcontainer } from '~/lib/webcontainer';

const logger = createScopedLogger('StaticAnalysis');

export interface LintResult {
  filePath: string;
  errors: LintError[];
  warnings: LintError[];
}

export interface LintError {
  line: number;
  column: number;
  message: string;
  ruleId?: string;
  severity: 'error' | 'warning';
}

export interface FormatResult {
  filePath: string;
  formattedContent: string;
  changed: boolean;
}

export class StaticAnalysisService {
  private static _instance: StaticAnalysisService;

  static getInstance(): StaticAnalysisService {
    if (!StaticAnalysisService._instance) {
      StaticAnalysisService._instance = new StaticAnalysisService();
    }
    return StaticAnalysisService._instance;
  }

  /**
   * Check if ESLint is available in the project
   */
  async hasESLint(): Promise<boolean> {
    try {
      const wc = await webcontainer;
      const packageJsonContent = await wc.fs.readFile('package.json', 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      return !!(packageJson.devDependencies?.eslint || packageJson.dependencies?.eslint);
    } catch (error) {
      logger.error('Failed to check ESLint availability:', error);
      return false;
    }
  }

  /**
   * Check if Prettier is available in the project
   */
  async hasPrettier(): Promise<boolean> {
    try {
      const wc = await webcontainer;
      const packageJsonContent = await wc.fs.readFile('package.json', 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      return !!(packageJson.devDependencies?.prettier || packageJson.dependencies?.prettier);
    } catch (error) {
      logger.error('Failed to check Prettier availability:', error);
      return false;
    }
  }

  /**
   * Install ESLint and Prettier if not available
   */
  async installDependencies(): Promise<boolean> {
    try {
      const wc = await webcontainer;
      
      const process = await wc.spawn('npm', ['install', 'eslint', 'prettier', '--save-dev']);
      
      let output = '';
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data;
          },
        }),
      );
      
      const exitCode = await process.exit;
      
      if (exitCode === 0) {
        logger.info('ESLint and Prettier installed successfully');
        return true;
      } else {
        logger.error('Failed to install ESLint and Prettier:', output);
        return false;
      }
    } catch (error) {
      logger.error('Failed to install ESLint and Prettier:', error);
      return false;
    }
  }

  /**
   * Run ESLint on the project
   */
  async runESLint(): Promise<LintResult[]> {
    try {
      const hasEslint = await this.hasESLint();
      if (!hasEslint) {
        logger.warn('ESLint not found, installing...');
        const installed = await this.installDependencies();
        if (!installed) {
          return [];
        }
      }

      const wc = await webcontainer;
      
      // Check if ESLint config exists
      let hasConfig = false;
      const configFiles = ['.eslintrc.js', '.eslintrc.cjs', '.eslintrc.json', '.eslintrc', 'eslint.config.mjs'];
      
      for (const configFile of configFiles) {
        try {
          await wc.fs.readFile(configFile);
          hasConfig = true;
          break;
        } catch {
          // File not found, try next
        }
      }

      // If no config, create a basic one
      if (!hasConfig) {
        const basicConfig = `{
  "extends": ["eslint:recommended"],
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module"
  },
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn",
    "semi": ["error", "always"],
    "quotes": ["error", "single"]
  }
}`;
        
        await wc.fs.writeFile('.eslintrc.json', basicConfig);
        logger.info('Created basic ESLint config');
      }

      const process = await wc.spawn('npx', ['eslint', '.', '--format', 'json']);
      
      let output = '';
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data;
          },
        }),
      );
      
      const exitCode = await process.exit;
      
      if (exitCode === 0 || exitCode === 1) {
        try {
          const results = JSON.parse(output);
          return results.map((result: any) => ({
            filePath: result.filePath,
            errors: result.messages.filter((msg: any) => msg.severity === 2).map((msg: any) => ({
              line: msg.line,
              column: msg.column,
              message: msg.message,
              ruleId: msg.ruleId,
              severity: 'error'
            })),
            warnings: result.messages.filter((msg: any) => msg.severity === 1).map((msg: any) => ({
              line: msg.line,
              column: msg.column,
              message: msg.message,
              ruleId: msg.ruleId,
              severity: 'warning'
            }))
          }));
        } catch (parseError) {
          logger.error('Failed to parse ESLint output:', parseError);
        }
      }
      
      return [];
    } catch (error) {
      logger.error('Failed to run ESLint:', error);
      return [];
    }
  }

  /**
   * Run Prettier on the project
   */
  async runPrettier(files?: string[]): Promise<FormatResult[]> {
    try {
      const hasPrettier = await this.hasPrettier();
      if (!hasPrettier) {
        logger.warn('Prettier not found, installing...');
        const installed = await this.installDependencies();
        if (!installed) {
          return [];
        }
      }

      const wc = await webcontainer;
      
      // Check if Prettier config exists
      let hasConfig = false;
      const configFiles = ['.prettierrc', '.prettierrc.js', '.prettierrc.cjs', '.prettierrc.json', 'prettier.config.js'];
      
      for (const configFile of configFiles) {
        try {
          await wc.fs.readFile(configFile);
          hasConfig = true;
          break;
        } catch {
          // File not found, try next
        }
      }

      // If no config, create a basic one
      if (!hasConfig) {
        const basicConfig = `{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 80,
  "useTabs": false
}`;
        
        await wc.fs.writeFile('.prettierrc.json', basicConfig);
        logger.info('Created basic Prettier config');
      }

      // Run Prettier on all files or specified files
      const targetFiles = files && files.length > 0 ? files : ['.'];
      
      const process = await wc.spawn('npx', ['prettier', ...targetFiles, '--write']);
      
      let output = '';
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data;
          },
        }),
      );
      
      const exitCode = await process.exit;
      
      if (exitCode === 0) {
        const formattedFiles = output
          .split('\n')
          .filter(line => line.includes('File') && (line.includes('wrote') || line.includes('unchanged')))
          .map(line => {
            const match = line.match(/File "([^"]+)" /);
            return match ? match[1] : null;
          })
          .filter(Boolean);

        const results: FormatResult[] = [];
        for (const filePath of formattedFiles) {
          try {
            const content = await wc.fs.readFile(filePath, 'utf-8');
            results.push({
              filePath,
              formattedContent: content,
              changed: output.includes(`File "${filePath}"`) && !output.includes(`File "${filePath}" was not modified`)
            });
          } catch (readError) {
            logger.error(`Failed to read file ${filePath} after formatting:`, readError);
          }
        }
        
        return results;
      }
      
      return [];
    } catch (error) {
      logger.error('Failed to run Prettier:', error);
      return [];
    }
  }

  /**
   * Auto-fix ESLint errors
   */
  async fixESLintErrors(): Promise<LintResult[]> {
    try {
      const wc = await webcontainer;
      
      const process = await wc.spawn('npx', ['eslint', '.', '--fix']);
      
      let output = '';
      process.output.pipeTo(
        new WritableStream({
          write(data) {
            output += data;
          },
        }),
      );
      
      const exitCode = await process.exit;
      
      if (exitCode === 0 || exitCode === 1) {
        return await this.runESLint(); // Re-run to get remaining errors
      }
      
      return [];
    } catch (error) {
      logger.error('Failed to fix ESLint errors:', error);
      return [];
    }
  }

  /**
   * Run full static analysis (ESLint + Prettier)
   */
  async runFullAnalysis(autoFix: boolean = true): Promise<{
    eslintResults: LintResult[];
    prettierResults: FormatResult[];
  }> {
    logger.info('Starting full static analysis...');
    
    let eslintResults = await this.runESLint();
    
    if (autoFix && eslintResults.some(result => result.errors.length > 0 || result.warnings.length > 0)) {
      logger.info('Fixing ESLint errors...');
      eslintResults = await this.fixESLintErrors();
    }
    
    const prettierResults = await this.runPrettier();
    
    logger.info('Static analysis complete');
    
    return {
      eslintResults,
      prettierResults
    };
  }

  /**
   * Get summary of analysis results
   */
  getAnalysisSummary(eslintResults: LintResult[], prettierResults: FormatResult[]): string {
    const totalErrors = eslintResults.reduce((sum, result) => sum + result.errors.length, 0);
    const totalWarnings = eslintResults.reduce((sum, result) => sum + result.warnings.length, 0);
    const formattedFiles = prettierResults.filter(result => result.changed).length;
    
    let summary = `Static Analysis Summary:\n\n`;
    summary += `ESLint: ${totalErrors} errors, ${totalWarnings} warnings\n`;
    summary += `Prettier: ${formattedFiles} files formatted\n`;
    
    if (totalErrors === 0 && totalWarnings === 0 && formattedFiles === 0) {
      summary += '\n✅ Code is clean and properly formatted!';
    } else {
      summary += `\n⚠️ Found ${totalErrors + totalWarnings} issues and formatted ${formattedFiles} files`;
    }
    
    return summary;
  }
}

export const staticAnalysisService = StaticAnalysisService.getInstance();