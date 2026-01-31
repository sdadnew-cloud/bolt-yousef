import { toast } from 'react-toastify';

export interface ProjectPlanInput {
  description: string;
  techStack: string[];
}

export class ProjectPlannerAgent {
  async generateProjectPlan(input: ProjectPlanInput) {
    const { description, techStack } = input;

    const prompt = `
      Create a comprehensive PROJECT_PLAN.md for the following project:

      Project Description: ${description}
      Tech Stack: ${techStack.join(', ')}

      The plan should include the following sections:
      1. Overview
      2. Features
      3. Architecture
      4. File Structure
      5. Implementation Plan
      6. Quality Criteria

      Format the output as a single markdown file wrapped in a <boltAction type="file" filePath="PROJECT_PLAN.md"> tag.
    `;

    /*
     * In Bolt, we usually send this to the chat or handle it via workbench
     * For this agent, we will trigger a workbench action to "suggest" this file
     */
    try {
      /*
       * This is a placeholder for actual LLM call integration
       * In a real implementation, this would call the /api/chat or similar
       */
      console.log('Generating Project Plan with prompt:', prompt);

      /*
       * For now, we'll simulate the intent.
       * The actual generation would likely be handled by the main AI chat with a specific instruction.
       */
      return prompt;
    } catch (error) {
      console.error('Failed to generate project plan:', error);
      toast.error('Failed to generate project plan');
      throw error;
    }
  }

  async generateArchitectureDocs(files: Record<string, any>) {
    const fileList = Object.keys(files).join('\n');

    const prompt = `
      Based on the following project files, generate a detailed ARCHITECTURE.md:

      Files:
      ${fileList}

      The documentation should include:
      1. Overview
      2. Core Components
      3. Data Flow
      4. Technical Decisions
      5. Extension Points

      Format the output as a single markdown file wrapped in a <boltAction type="file" filePath="ARCHITECTURE.md"> tag.
    `;

    try {
      console.log('Generating Architecture Docs with prompt:', prompt);
      return prompt;
    } catch (error) {
      console.error('Failed to generate architecture docs:', error);
      toast.error('Failed to generate architecture docs');
      throw error;
    }
  }
}

export const projectPlannerAgent = new ProjectPlannerAgent();
