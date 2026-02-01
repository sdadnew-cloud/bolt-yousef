/**
 * 📁 ملف: agent-system.ts
 * 📝 وصف: منسق نظام الوكلاء المتعددين (Multi-Agent System Orchestrator)
 * 🔧 الغرض: إدارة تدفق العمل بين المخطط، المبرمج، والمراجع
 */

import { plannerAgent } from './planner-agent';
import { coderAgent } from './coder-agent';
import { reviewerAgent } from './reviewer-agent';
import type { IProviderSetting } from '~/types/model';

export interface AgentProgressUpdate {
  agentName: string;
  stepId?: string;
  message: string;
  status: 'info' | 'working' | 'completed' | 'failed';
}

export type AgentProgressCallback = (update: AgentProgressUpdate) => void;

export interface AgentOptions {
  env: any;
  apiKeys?: Record<string, string>;
  providerSettings?: Record<string, IProviderSetting>;
  providerName: string;
  modelName: string;
}

export interface WorkflowResult {
  plan: any;
  combinedCode: string;
}

export class AgentSystem {
  private _maxIterations = 3;

  async runWorkflow(task: string, files: string[], options: AgentOptions, onProgress?: AgentProgressCallback): Promise<WorkflowResult> {
    console.log('Starting Multi-Agent Workflow for task:', task);
    onProgress?.({ agentName: 'النظام', message: 'بدء سير عمل الوكلاء المتعددين...', status: 'info' });

    let combinedCode = '';

    try {
      // 1. المخطط (Planner)
      onProgress?.({ agentName: 'المخطط', message: 'تحليل المهمة وإنشاء خطة التنفيذ...', status: 'working' });
      const plan = await plannerAgent.createPlan(task, files, options);
      onProgress?.({
        agentName: 'المخطط',
        message: `تم إنشاء خطة تتكون من ${plan.steps.length} خطوات.`,
        status: 'completed',
      });

      // 2. حلقة المبرمج والمراجع (Coder and Reviewer Loop)
      for (const step of plan.steps) {
        let iterations = 0;
        let approved = false;
        let currentCode = '';

        onProgress?.({
          agentName: 'النظام',
          stepId: step.id,
          message: `بدء الخطوة ${step.id}: ${step.description}`,
          status: 'info',
        });

        while (iterations < this._maxIterations && !approved) {
          iterations++;
          onProgress?.({
            agentName: 'المبرمج',
            stepId: step.id,
            message: `محاولة تنفيذ الخطوة ${step.id} (المحاولة ${iterations})...`,
            status: 'working',
          });

          // المبرمج ينفذ الخطوة
          currentCode = await coderAgent.implementStep(step, task, options);

          onProgress?.({
            agentName: 'المراجع',
            stepId: step.id,
            message: `مراجعة الكود للخطوة ${step.id}...`,
            status: 'working',
          });

          // المراجع يراجع الكود
          const review = await reviewerAgent.reviewCode(currentCode, task, options);

          if (review.approved) {
            approved = true;
            step.status = 'completed';
            combinedCode += '\n' + currentCode;
            onProgress?.({
              agentName: 'المراجع',
              stepId: step.id,
              message: `تمت الموافقة على الخطوة ${step.id}!`,
              status: 'completed',
            });
          } else {
            onProgress?.({
              agentName: 'المراجع',
              stepId: step.id,
              message: `تم رفض الخطوة ${step.id}. ملاحظات: ${review.feedback}`,
              status: 'info',
            });
            // في تطبيق حقيقي، يمكننا تمرير الملاحظات للمبرمج في المحاولة التالية
          }
        }

        if (!approved) {
          step.status = 'failed';
          onProgress?.({
            agentName: 'النظام',
            stepId: step.id,
            message: `فشلت الخطوة ${step.id} بعد ${this._maxIterations} محاولات.`,
            status: 'failed',
          });
          break;
        }
      }

      onProgress?.({ agentName: 'النظام', message: 'اكتمل سير عمل الوكلاء المتعددين بنجاح.', status: 'completed' });

      return {
        plan,
        combinedCode: combinedCode.trim()
      };
    } catch (error: any) {
      console.error('Error in Multi-Agent Workflow:', error);
      onProgress?.({ agentName: 'النظام', message: `خطأ في سير العمل: ${error.message}`, status: 'failed' });
      throw error;
    }
  }
}

export const agentSystem = new AgentSystem();
