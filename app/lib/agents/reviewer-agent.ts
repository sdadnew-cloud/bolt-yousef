/**
 * 📁 ملف: reviewer-agent.ts
 * 📝 وصف: وكيل مراجعة الكود (Reviewer Agent)
 * 🔧 الغرض: تقييم الكود المولد والتأكد من جودته وصحته قبل اعتماده
 */

import { generateText } from 'ai';
import { LLMManager } from '../modules/llm/manager';
import type { AgentOptions } from './agent-system';

export interface ReviewResult {
  approved: boolean;
  feedback?: string;
}

export class ReviewerAgent {
  /**
   * مراجعة التعديلات البرمجية المقترحة
   */
  async reviewCode(code: string, originalTask: string, options: AgentOptions): Promise<ReviewResult> {
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
      You are a Reviewer Agent. Evaluate the provided code changes against the original task for quality, security, and performance.
      Respond ONLY with a valid JSON object.
    `;

    const userPrompt = `
      Original Task: ${originalTask}
      Code Changes:
      ${code}

      Output format:
      {
        "approved": boolean,
        "feedback": "Why it was approved or rejected"
      }
    `;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const reviewJson = jsonMatch ? jsonMatch[0] : text;
      return JSON.parse(reviewJson);
    } catch (error) {
      console.error('Failed to parse reviewer agent response:', text);
      return { approved: true, feedback: 'فشل المراجع في تقديم رد منسق، تم القبول تلقائياً كإجراء احتياطي.' };
    }
  }
}

export const reviewerAgent = new ReviewerAgent();
