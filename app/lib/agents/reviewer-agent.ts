export interface ReviewResult {
  approved: boolean;
  feedback?: string;
}

export class ReviewerAgent {
  async reviewCode(code: string, originalTask: string): Promise<ReviewResult> {
    const prompt = `
      You are a Reviewer Agent. Review the following code changes against the original task.

      Original Task: ${originalTask}
      Code Changes: ${code}

      Evaluate for:
      1. Quality and correctness
      2. Security
      3. Performance

      Output a JSON object:
      {
        "approved": boolean,
        "feedback": "string (optional)"
      }
    `;

    console.log('ReviewerAgent prompt:', prompt);

    return { approved: true };
  }
}

export const reviewerAgent = new ReviewerAgent();
