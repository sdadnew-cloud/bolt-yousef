/**
 * 📁 ملف: agent-system.ts
 * 📝 وصف: منسق نظام الوكلاء المتعددين (Multi-Agent System Orchestrator)
 * 🔧 الغرض: إدارة تدفق العمل بين المخطط، المبرمج، والمراجع
 */

import { plannerAgent } from './planner-agent';
import { coderAgent } from './coder-agent';
import { reviewerAgent } from './reviewer-agent';

export interface AgentProgressUpdate {
  agentName: string;
  stepId?: string;
  message: string;
  status: 'info' | 'working' | 'completed' | 'failed';
}

export type AgentProgressCallback = (update: AgentProgressUpdate) => void;

export class AgentSystem {
  private _maxIterations = 3;

  async runWorkflow(task: string, files: string[], onProgress?: AgentProgressCallback) {
    console.log('Starting Multi-Agent Workflow for task:', task);
    onProgress?.({ agentName: 'System', message: 'بدء سير عمل الوكلاء المتعددين...', status: 'info' });

    // 1. Planner
    onProgress?.({ agentName: 'Planner', message: 'تحليل المهمة وإنشاء خطة التنفيذ...', status: 'working' });
    const plan = await plannerAgent.createPlan(task, files);
    onProgress?.({
      agentName: 'Planner',
      message: `تم إنشاء خطة تتكون من ${plan.steps.length} خطوات.`,
      status: 'completed',
    });

    // 2. Coder and Reviewer Loop
    for (const step of plan.steps) {
      let iterations = 0;
      let approved = false;
      let currentCode = '';

      onProgress?.({
        agentName: 'System',
        stepId: step.id,
        message: `بدء الخطوة ${step.id}: ${step.description}`,
        status: 'info',
      });

      while (iterations < this._maxIterations && !approved) {
        iterations++;
        onProgress?.({
          agentName: 'Coder',
          stepId: step.id,
          message: `محاولة تنفيذ الخطوة ${step.id} (المحاولة ${iterations})...`,
          status: 'working',
        });

        // Coder implements
        currentCode = await coderAgent.implementStep(step, task);

        onProgress?.({
          agentName: 'Reviewer',
          stepId: step.id,
          message: `مراجعة الكود للخطوة ${step.id}...`,
          status: 'working',
        });

        // Reviewer reviews
        const review = await reviewerAgent.reviewCode(currentCode, task);

        if (review.approved) {
          approved = true;
          step.status = 'completed';
          onProgress?.({
            agentName: 'Reviewer',
            stepId: step.id,
            message: `تمت الموافقة على الخطوة ${step.id}!`,
            status: 'completed',
          });
        } else {
          onProgress?.({
            agentName: 'Reviewer',
            stepId: step.id,
            message: `تم رفض الخطوة ${step.id}. ملاحظات: ${review.feedback}`,
            status: 'info',
          });
        }
      }

      if (!approved) {
        step.status = 'failed';
        onProgress?.({
          agentName: 'System',
          stepId: step.id,
          message: `فشلت الخطوة ${step.id} بعد ${this._maxIterations} محاولات.`,
          status: 'failed',
        });
        break;
      }
    }

    onProgress?.({ agentName: 'System', message: 'اكتمل سير عمل الوكلاء المتعددين.', status: 'completed' });

    return plan;
  }
}

export const agentSystem = new AgentSystem();
