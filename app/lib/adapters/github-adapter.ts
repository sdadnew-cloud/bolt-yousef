/**
 * 📁 ملف: github-adapter.ts
 * 📝 وصف: محول خدمة GitHub (GitHub Git Adapter)
 * 🔧 الغرض: تنفيذ عمليات Git الحقيقية على منصة GitHub
 */

import { Octokit } from '@octokit/rest';
import Cookies from 'js-cookie';

export interface GitProviderAdapter {
  name: string;
  createRepository(name: string, isPrivate?: boolean): Promise<string>;
  getBranches(owner: string, repo: string): Promise<string[]>;
  commitAndPush(owner: string, repo: string, message: string, files: Record<string, string>, branch?: string): Promise<string>;
}

export class GitHubAdapter implements GitProviderAdapter {
  name = 'GitHub';
  private _octokit: Octokit | null = null;

  private getOctokit(): Octokit {
    if (this._octokit) return this._octokit;

    const token = Cookies.get('githubToken');
    if (!token) throw new Error('يرجى تسجيل الدخول إلى GitHub أولاً.');

    this._octokit = new Octokit({ auth: token });
    return this._octokit;
  }

  async createRepository(name: string, isPrivate: boolean = false): Promise<string> {
    const octokit = this.getOctokit();
    const { data } = await octokit.repos.createForAuthenticatedUser({
      name,
      private: isPrivate,
      auto_init: true
    });
    return data.html_url;
  }

  async getBranches(owner: string, repo: string): Promise<string[]> {
    const octokit = this.getOctokit();
    const { data } = await octokit.repos.listBranches({ owner, repo });
    return data.map(b => b.name);
  }

  async commitAndPush(owner: string, repo: string, message: string, files: Record<string, string>, branch: string = 'main'): Promise<string> {
    const octokit = this.getOctokit();

    // 1. جلب مرجع الفرع الحالي
    const { data: refData } = await octokit.git.getRef({ owner, repo, ref: `heads/${branch}` });
    const latestCommitSha = refData.object.sha;

    // 2. إنشاء Blobs للملفات
    const tree = await Promise.all(Object.entries(files).map(async ([path, content]) => {
      const { data: blobData } = await octokit.git.createBlob({ owner, repo, content, encoding: 'utf-8' });
      return { path, mode: '100644' as const, type: 'blob' as const, sha: blobData.sha };
    }));

    // 3. إنشاء شجرة (Tree)
    const { data: treeData } = await octokit.git.createTree({ owner, repo, tree, base_tree: latestCommitSha });

    // 4. إنشاء الالتزام (Commit)
    const { data: commitData } = await octokit.git.createCommit({
      owner, repo, message, tree: treeData.sha, parents: [latestCommitSha]
    });

    // 5. تحديث المرجع
    await octokit.git.updateRef({ owner, repo, ref: `heads/${branch}`, sha: commitData.sha });

    return commitData.html_url;
  }
}
