import { type GitProviderAdapter } from './github-adapter';

export class BitbucketAdapter implements GitProviderAdapter {
  name = 'Bitbucket';

  async createRepository(name: string): Promise<string> {
    console.log(`Bitbucket: Creating repository ${name}`);
    return `https://bitbucket.org/user/${name}.git`;
  }

  async getBranches(repo: string): Promise<string[]> {
    return ['master'];
  }

  async commit(repo: string, message: string, files: any): Promise<void> {
    console.log(`Bitbucket: Committing with message "${message}"`);
  }

  async push(repo: string, branch: string): Promise<void> {
    console.log(`Bitbucket: Pushing to ${branch}`);
  }
}
