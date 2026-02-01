/**
 * 📁 ملف: gitlab-adapter.ts
 * 📝 وصف: محول خدمة GitLab (GitLab Git Adapter)
 */

import type { GitProviderAdapter } from './github-adapter';

export class GitLabAdapter implements GitProviderAdapter {
  name = 'GitLab';

  async createRepository(name: string, isPrivate: boolean = false): Promise<string> {
    console.log(`GitLab: Creating repository ${name}`);
    return `https://gitlab.com/user/${name}.git`;
  }

  async getBranches(owner: string, repo: string): Promise<string[]> {
    return ['main'];
  }

  async commitAndPush(owner: string, repo: string, message: string, files: Record<string, string>, branch: string = 'main'): Promise<string> {
    console.log(`GitLab: Committing and pushing to ${branch}`);
    return `https://gitlab.com/${owner}/${repo}/-/commit/main`;
  }
}
