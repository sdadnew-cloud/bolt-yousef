/**
 * 📁 ملف: planner-agent.ts
 * 📝 وصف: وكيل تخطيط المشاريع (Project Planner Agent)
 * 🔧 الغرض: تحليل المهام البرمجية الكبيرة وتقسيمها إلى خطوات تنفيذية منطقية
 */

import { generateText } from 'ai';
import { LLMManager } from '../modules/llm/manager';
import type { AgentOptions } from './agent-system';

export interface AgentStep {
  id: string;
  description: string;
  affectedFiles: string[];
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface AgentPlan {
  steps: AgentStep[];
}

export class PlannerAgent {
  /**
   * إنشاء خطة عمل برمجية بناءً على وصف المهمة
   */
  async createPlan(task: string, files: string[], options: AgentOptions): Promise<AgentPlan> {
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
      You are a Project Planner Agent. Analyze the user task and create a step-by-step execution plan.
      Respond ONLY with a valid JSON object.
    `;

    const userPrompt = `
      Task: ${task}
      Available Files: ${files.join(', ')}

      Output format:
      {
        "steps": [
          { "id": "1", "description": "Short description of step", "affectedFiles": ["file1.ts", "file2.ts"] }
        ]
      }
    `;

    const { text } = await generateText({
      model,
      system: systemPrompt,
      prompt: userPrompt,
    });

    try {
      // استخراج الـ JSON من النص
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const planJson = jsonMatch ? jsonMatch[0] : text;
      const plan = JSON.parse(planJson);

      return {
        steps: (plan.steps || []).map((step: any) => ({
          ...step,
          status: 'pending',
        })),
      };
    } catch (error) {
      console.error('Failed to parse planner agent response:', text);
      throw new Error('فشل المخطط في إنشاء خطة صالحة. يرجى المحاولة مرة أخرى.');
    }
  }
}

export const plannerAgent = new PlannerAgent();
