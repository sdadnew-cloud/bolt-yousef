/**
 * 📁 ملف: git-service.ts
 * 📝 وصف: خدمة Git المركزية (Central Git Service)
 * 🔧 الغرض: إدارة العمليات عبر مختلف مزودي خدمات Git
 */

import { GitHubAdapter } from '../adapters/github-adapter';
import { GitLabAdapter } from '../adapters/gitlab-adapter';
import { BitbucketAdapter } from '../adapters/bitbucket-adapter';
import type { GitProviderAdapter } from '../adapters/github-adapter';

export class GitService {
  private static _instance: GitService;
  private _adapters: Map<string, GitProviderAdapter> = new Map();
  private _currentProvider: string = 'GitHub';

  private constructor() {
    this._adapters.set('GitHub', new GitHubAdapter());
    this._adapters.set('GitLab', new GitLabAdapter());
    this._adapters.set('Bitbucket', new BitbucketAdapter());
  }

  static getInstance(): GitService {
    if (!GitService._instance) {
      GitService._instance = new GitService();
    }
    return GitService._instance;
  }

  setProvider(name: string) {
    if (this._adapters.has(name)) {
      this._currentProvider = name;
    }
  }

  getAdapter(): GitProviderAdapter {
    return this._adapters.get(this._currentProvider)!;
  }

  /**
   * تنفيذ التزام تلقائي (Auto-Commit)
   */
  async autoCommit(task: string, files: Record<string, string>, owner: string, repo: string) {
    const message = `AI Integration: ${task}`;
    const adapter = this.getAdapter();
    console.log(`[GitService] Auto-committing to ${adapter.name}...`);
    return await adapter.commitAndPush(owner, repo, message, files);
  }
}

export const gitService = GitService.getInstance();
