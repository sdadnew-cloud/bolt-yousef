/**
 * 📁 ملف: glm.ts
 * 📝 وصف: مزود خدمة GLM (Zhipu AI / BigModel)
 * 🔧 الغرض: التكامل مع نماذج GLM-4 للبرمجة والمحادثة
 */

import { BaseProvider } from '~/lib/modules/llm/base-provider';
import type { ModelInfo } from '~/lib/modules/llm/types';
import type { IProviderSetting } from '~/types/model';
import type { LanguageModelV1 } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

export default class GLMProvider extends BaseProvider {
  name = 'GLM';
  getApiKeyLink = 'https://open.bigmodel.cn/usercenter/apikeys';

  config = {
    apiTokenKey: 'GLM_API_KEY',
  };

  staticModels: ModelInfo[] = [
    {
      name: 'glm-4-plus',
      label: 'GLM-4-Plus',
      provider: 'GLM',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'glm-4-air',
      label: 'GLM-4-Air',
      provider: 'GLM',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
    },
    {
      name: 'glm-4-flash',
      label: 'GLM-4-Flash',
      provider: 'GLM',
      maxTokenAllowed: 128000,
      maxCompletionTokens: 4096,
    },
  ];

  getModelInstance(options: {
    model: string;
    serverEnv: any;
    apiKeys?: Record<string, string>;
    providerSettings?: Record<string, IProviderSetting>;
  }): LanguageModelV1 {
    const { model, serverEnv, apiKeys, providerSettings } = options;

    const { apiKey } = this.getProviderBaseUrlAndKey({
      apiKeys,
      providerSettings: providerSettings?.[this.name],
      serverEnv: serverEnv as any,
      defaultBaseUrlKey: '',
      defaultApiTokenKey: 'GLM_API_KEY',
    });

    if (!apiKey) {
      throw new Error(`Missing API key for ${this.name} provider`);
    }

    const zhipu = createOpenAI({
      apiKey,
      baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    });

    return zhipu(model);
  }
}
