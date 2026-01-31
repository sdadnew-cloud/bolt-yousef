import { type GitProviderAdapter } from './github-adapter';

export class GitLabAdapter implements GitProviderAdapter {
  name = 'GitLab';

  async createRepository(name: string): Promise<string> {
    console.log(`GitLab: Creating repository ${name}`);
    return `https://gitlab.com/user/${name}.git`;
  }

  async getBranches(repo: string): Promise<string[]> {
    return ['master'];
  }

  async commit(repo: string, message: string, files: any): Promise<void> {
    console.log(`GitLab: Committing with message "${message}"`);
  }

  async push(repo: string, branch: string): Promise<void> {
    console.log(`GitLab: Pushing to ${branch}`);
  }
}
