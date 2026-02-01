/**
 * 📁 ملف: coder-agent.ts
 * 📝 وصف: وكيل المبرمج (Coder Agent)
 * 🔧 الغرض: تنفيذ التعديلات البرمجية الفعلية بناءً على الخطوات المحددة
 */

import { generateText } from 'ai';
import { LLMManager } from '../modules/llm/manager';
import type { AgentOptions } from './agent-system';

export class CoderAgent {
  /**
   * تنفيذ خطوة محددة من خطة العمل
   */
  async implementStep(step: any, task: string, options: AgentOptions): Promise<string> {
    const llmManager = LLMManager.getInstance();
    const provider = llmManager.getProvider(options.providerName);

    if (!provider) {
      throw new Error(`Provider ${options.providerName} not found`);
    }

    const model = provider.getModelInstance({
      model: options.modelName,
      serverEnv: options.env,
      apiKeys: options.apiKeys,
      providerSettings: options.providerSettings,
    });

    const systemPrompt = `
      You are a Coder Agent. Your job is to implement specific steps of a coding plan.
      Respond with the necessary code changes using <boltAction type="file" filePath="..."> tags.
      Always maintain code quality and follow best practices.
    `;

    const userPrompt = `
      Original Task: ${task}
      Current Step: ${step.description}
      Affected Files: ${step.affectedFiles.join(', ')}

      Please implement the changes for this step.
    `;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });

    return text;
  }
}

export const coderAgent = new CoderAgent();
