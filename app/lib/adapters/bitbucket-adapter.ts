/**
 * 📁 ملف: bitbucket-adapter.ts
 * 📝 وصف: محول خدمة Bitbucket (Bitbucket Git Adapter)
 */

import type { GitProviderAdapter } from './github-adapter';

export class BitbucketAdapter implements GitProviderAdapter {
  name = 'Bitbucket';

  async createRepository(name: string, isPrivate: boolean = false): Promise<string> {
    console.log(`Bitbucket: Creating repository ${name}`);
    return `https://bitbucket.org/user/${name}.git`;
  }

  async getBranches(owner: string, repo: string): Promise<string[]> {
    return ['master'];
  }

  async commitAndPush(owner: string, repo: string, message: string, files: Record<string, string>, branch: string = 'master'): Promise<string> {
    console.log(`Bitbucket: Committing and pushing to ${branch}`);
    return `https://bitbucket.org/${owner}/${repo}/commits`;
  }
}
