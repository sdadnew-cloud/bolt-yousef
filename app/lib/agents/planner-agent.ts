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
  async createPlan(task: string, files: string[]): Promise<AgentPlan> {
    const prompt = `
      You are a Project Planner Agent. Analyze the following task and create an execution plan.

      Task: ${task}
      Available Files: ${files.join(', ')}

      Output a JSON object with a list of steps. Each step should have:
      - id (string)
      - description (string)
      - affectedFiles (string[])

      Example:
      {
        "steps": [
          { "id": "1", "description": "Update button styles", "affectedFiles": ["app/components/Button.tsx"] }
        ]
      }
    `;

    console.log('PlannerAgent prompt:', prompt);

    /*
     * In a real implementation, this would call the LLM and parse the JSON response.
     * For now, we return a mock plan or the prompt to be processed.
     */
    return { steps: [] };
  }
}

export const plannerAgent = new PlannerAgent();
