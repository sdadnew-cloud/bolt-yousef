import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('LocalModel');

export interface LocalModel {
  id: string;
  name: string;
  description: string;
  provider: 'ollama' | 'lmstudio';
  defaultModel: string;
  apiBaseUrl?: string;
  apiKey?: string;
  capabilities: string[];
  status: 'available' | 'connecting' | 'error';
  error?: string;
}

export interface LocalModelConfig {
  ollama: {
    enabled: boolean;
    apiBaseUrl: string;
    defaultModel: string;
  };
  lmstudio: {
    enabled: boolean;
    apiBaseUrl: string;
    defaultModel: string;
  };
}

export const defaultLocalModels: LocalModel[] = [
  {
    id: 'ollama-llama3',
    name: 'Ollama Llama 3',
    description: 'Llama 3 model running locally via Ollama',
    provider: 'ollama',
    defaultModel: 'llama3:latest',
    apiBaseUrl: 'http://localhost:11434',
    capabilities: ['text-generation', 'code-completion', 'reasoning'],
    status: 'available'
  },
  {
    id: 'ollama-mistral',
    name: 'Ollama Mistral',
    description: 'Mistral model running locally via Ollama',
    provider: 'ollama',
    defaultModel: 'mistral:latest',
    apiBaseUrl: 'http://localhost:11434',
    capabilities: ['text-generation', 'code-completion', 'fast-response'],
    status: 'available'
  },
  {
    id: 'ollama-codegemma',
    name: 'Ollama CodeGemma',
    description: 'CodeGemma model optimized for coding tasks',
    provider: 'ollama',
    defaultModel: 'codegemma:latest',
    apiBaseUrl: 'http://localhost:11434',
    capabilities: ['code-completion', 'debugging', 'refactoring'],
    status: 'available'
  },
  {
    id: 'lmstudio-llama2',
    name: 'LM Studio Llama 2',
    description: 'Llama 2 model running locally via LM Studio',
    provider: 'lmstudio',
    defaultModel: 'llama2',
    apiBaseUrl: 'http://localhost:1234',
    capabilities: ['text-generation', 'code-completion', 'chat'],
    status: 'available'
  },
  {
    id: 'lmstudio-gemma',
    name: 'LM Studio Gemma',
    description: 'Gemma model running locally via LM Studio',
    provider: 'lmstudio',
    defaultModel: 'gemma',
    apiBaseUrl: 'http://localhost:1234',
    capabilities: ['text-generation', 'code-completion', 'multimodal'],
    status: 'available'
  }
];

export class LocalModelService {
  private static _instance: LocalModelService;
  private _config: LocalModelConfig = {
    ollama: {
      enabled: false,
      apiBaseUrl: 'http://localhost:11434',
      defaultModel: 'llama3:latest'
    },
    lmstudio: {
      enabled: false,
      apiBaseUrl: 'http://localhost:1234',
      defaultModel: 'llama2'
    }
  };

  private _models: LocalModel[] = [...defaultLocalModels];
  private _selectedModelId: string | null = null;

  static getInstance(): LocalModelService {
    if (!LocalModelService._instance) {
      LocalModelService._instance = new LocalModelService();
    }
    return LocalModelService._instance;
  }

  /**
   * Get all available local models
   */
  getModels(): LocalModel[] {
    return this._models;
  }

  /**
   * Get a specific model by ID
   */
  getModelById(id: string): LocalModel | undefined {
    return this._models.find(model => model.id === id);
  }

  /**
   * Get currently selected local model
   */
  getSelectedModel(): LocalModel | null {
    if (!this._selectedModelId) {
      return null;
    }
    
    return this.getModelById(this._selectedModelId) || null;
  }

  /**
   * Set selected local model
   */
  setSelectedModel(id: string | null): void {
    if (id === null) {
      this._selectedModelId = null;
      logger.info('Local model support disabled');
      return;
    }

    const model = this.getModelById(id);
    if (model) {
      this._selectedModelId = id;
      logger.info(`Selected local model: ${model.name}`);
    }
  }

  /**
   * Check if local model support is enabled
   */
  isEnabled(): boolean {
    return this._selectedModelId !== null;
  }

  /**
   * Get configuration for a specific provider
   */
  getProviderConfig(provider: 'ollama' | 'lmstudio'): LocalModelConfig['ollama'] {
    return this._config[provider];
  }

  /**
   * Update provider configuration
   */
  updateProviderConfig(provider: 'ollama' | 'lmstudio', config: Partial<LocalModelConfig['ollama']>): void {
    this._config[provider] = { ...this._config[provider], ...config };
    logger.info(`Updated ${provider} config:`, config);
  }

  /**
   * Toggle local model support
   */
  toggleEnabled(enabled: boolean): void {
    if (enabled && !this._selectedModelId) {
      this._selectedModelId = 'ollama-llama3'; // Default to Ollama Llama 3
    } else if (!enabled) {
      this._selectedModelId = null;
    }
  }

  /**
   * Test connection to a local model API
   */
  async testConnection(modelId: string): Promise<boolean> {
    const model = this.getModelById(modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }

    // Update status to connecting
    this._updateModelStatus(modelId, 'connecting');

    try {
      let connected = false;
      
      if (model.provider === 'ollama') {
        connected = await this._testOllamaConnection(model);
      } else if (model.provider === 'lmstudio') {
        connected = await this._testLMStudioConnection(model);
      }

      if (connected) {
        this._updateModelStatus(modelId, 'available');
        logger.info(`Successfully connected to ${model.name}`);
      } else {
        this._updateModelStatus(modelId, 'error', 'Connection failed');
        logger.error(`Failed to connect to ${model.name}`);
      }

      return connected;
    } catch (error) {
      this._updateModelStatus(modelId, 'error', error instanceof Error ? error.message : 'Unknown error');
      logger.error(`Connection test failed for ${model.name}:`, error);
      return false;
    }
  }

  /**
   * Test Ollama API connection
   */
  private async _testOllamaConnection(model: LocalModel): Promise<boolean> {
    try {
      const response = await fetch(`${model.apiBaseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;
    } catch (error) {
      logger.error('Ollama connection test failed:', error);
      return false;
    }
  }

  /**
   * Test LM Studio API connection
   */
  private async _testLMStudioConnection(model: LocalModel): Promise<boolean> {
    try {
      const response = await fetch(`${model.apiBaseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;
    } catch (error) {
      logger.error('LM Studio connection test failed:', error);
      return false;
    }
  }

  /**
   * Update model status
   */
  private _updateModelStatus(modelId: string, status: LocalModel['status'], error?: string): void {
    this._models = this._models.map(model => 
      model.id === modelId 
        ? { ...model, status, error } 
        : model
    );
  }

  /**
   * Get available models from Ollama
   */
  async getOllamaModels(): Promise<string[]> {
    try {
      const config = this._config.ollama;
      const response = await fetch(`${config.apiBaseUrl}/api/tags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return data.models.map((model: any) => model.name);
      }

      return [];
    } catch (error) {
      logger.error('Failed to fetch Ollama models:', error);
      return [];
    }
  }

  /**
   * Get available models from LM Studio
   */
  async getLMStudioModels(): Promise<string[]> {
    try {
      const config = this._config.lmstudio;
      const response = await fetch(`${config.apiBaseUrl}/v1/models`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        const data = await response.json();
        return data.data.map((model: any) => model.id);
      }

      return [];
    } catch (error) {
      logger.error('Failed to fetch LM Studio models:', error);
      return [];
    }
  }

  /**
   * Generate text using local model
   */
  async generateText(prompt: string, options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<string> {
    if (!this._selectedModelId) {
      throw new Error('No local model selected');
    }

    const model = this.getModelById(this._selectedModelId);
    if (!model) {
      throw new Error('Selected model not found');
    }

    const effectiveModel = options?.model || model.defaultModel;
    
    try {
      let response: Response;
      
      if (model.provider === 'ollama') {
        response = await this._generateWithOllama(prompt, effectiveModel, options);
      } else if (model.provider === 'lmstudio') {
        response = await this._generateWithLMStudio(prompt, effectiveModel, options);
      } else {
        throw new Error('Unsupported provider');
      }

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (model.provider === 'ollama') {
        return data.response;
      } else {
        return data.choices[0]?.text || '';
      }
    } catch (error) {
      logger.error('Text generation failed:', error);
      throw error;
    }
  }

  /**
   * Generate text with Ollama
   */
  private async _generateWithOllama(prompt: string, model: string, options?: any): Promise<Response> {
    const config = this._config.ollama;
    
    return fetch(`${config.apiBaseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: {
          temperature: options?.temperature ?? 0.7,
          num_predict: options?.maxTokens ?? 4096
        }
      })
    });
  }

  /**
   * Generate text with LM Studio
   */
  private async _generateWithLMStudio(prompt: string, model: string, options?: any): Promise<Response> {
    const config = this._config.lmstudio;
    
    return fetch(`${config.apiBaseUrl}/v1/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.maxTokens ?? 4096,
        stream: false
      })
    });
  }

  /**
   * Check if a specific model is available locally
   */
  async isModelAvailable(modelId: string): Promise<boolean> {
    const model = this.getModelById(modelId);
    if (!model) {
      return false;
    }

    return await this.testConnection(modelId);
  }

  /**
   * Get performance metrics for local model
   */
  async getPerformanceMetrics(): Promise<{
    responseTime: number;
    tokenCount: number;
    memoryUsage?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const prompt = 'Hello, how are you?';
      const response = await this.generateText(prompt, {
        maxTokens: 100,
        temperature: 0.1
      });

      const responseTime = Date.now() - startTime;
      const tokenCount = response.length / 4; // Rough estimate

      return {
        responseTime,
        tokenCount
      };
    } catch (error) {
      logger.error('Performance metric calculation failed:', error);
      return {
        responseTime: 0,
        tokenCount: 0
      };
    }
  }
}

export const localModelService = LocalModelService.getInstance();