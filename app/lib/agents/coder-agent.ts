export class CoderAgent {
  async implementStep(step: any, context: string): Promise<string> {
    const prompt = `
      You are a Coder Agent. Implement the following step:

      Description: ${step.description}
      Affected Files: ${step.affectedFiles.join(', ')}
      Context: ${context}

      Provide the code changes in <boltAction> tags.
    `;

    console.log('CoderAgent prompt:', prompt);

    return prompt;
  }
}

export const coderAgent = new CoderAgent();
