import { plannerAgent } from './planner-agent';
import { coderAgent } from './coder-agent';
import { reviewerAgent } from './reviewer-agent';

export class AgentSystem {
  private _maxIterations = 3;

  async runWorkflow(task: string, files: string[]) {
    console.log('Starting Multi-Agent Workflow for task:', task);

    // 1. Planner
    const plan = await plannerAgent.createPlan(task, files);

    // 2. Coder and Reviewer Loop
    for (const step of plan.steps) {
      let iterations = 0;
      let approved = false;
      let currentCode = '';

      while (iterations < this._maxIterations && !approved) {
        iterations++;
        console.log(`Step ${step.id}: Iteration ${iterations}`);

        // Coder implements
        currentCode = await coderAgent.implementStep(step, task);

        // Reviewer reviews
        const review = await reviewerAgent.reviewCode(currentCode, task);

        if (review.approved) {
          approved = true;
          step.status = 'completed';
          console.log(`Step ${step.id} approved!`);
        } else {
          console.log(`Step ${step.id} rejected. Feedback: ${review.feedback}`);

          // In real implementation, the feedback would be passed back to the Coder.
        }
      }

      if (!approved) {
        step.status = 'failed';
        console.error(`Step ${step.id} failed after ${this._maxIterations} iterations.`);
        break;
      }
    }

    return plan;
  }
}

export const agentSystem = new AgentSystem();
