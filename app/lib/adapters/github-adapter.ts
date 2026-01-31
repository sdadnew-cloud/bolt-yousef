export interface GitProviderAdapter {
  name: string;
  createRepository(name: string): Promise<string>;
  getBranches(repo: string): Promise<string[]>;
  commit(repo: string, message: string, files: any): Promise<void>;
  push(repo: string, branch: string): Promise<void>;
}

export class GitHubAdapter implements GitProviderAdapter {
  name = 'GitHub';

  async createRepository(name: string): Promise<string> {
    console.log(`GitHub: Creating repository ${name}`);
    return `https://github.com/user/${name}.git`;
  }

  async getBranches(repo: string): Promise<string[]> {
    return ['main', 'develop'];
  }

  async commit(repo: string, message: string, files: any): Promise<void> {
    console.log(`GitHub: Committing with message "${message}"`);
  }

  async push(repo: string, branch: string): Promise<void> {
    console.log(`GitHub: Pushing to ${branch}`);
  }
}
