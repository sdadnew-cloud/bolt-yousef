/**
 * 📁 ملف: project-planner.ts
 * 📝 وصف: وكيل تخطيط المشاريع المتقدم (Advanced Project Planner Agent)
 * 🔧 الغرض: توليد خطط المشاريع وتوثيق المعمارية بشكل تلقائي
 */

import { toast } from 'react-toastify';

export interface ProjectPlanInput {
  description: string;
  techStack: string[];
}

export class ProjectPlanner {
  /**
   * توليد خطة مشروع كاملة
   */
  async generateProjectPlan(description: string, techStack: string[]): Promise<string> {
    const prompt = `
      You are a Senior Project Planner. Create a comprehensive PROJECT_PLAN.md for:

      Description: ${description}
      Tech Stack: ${techStack.join(', ')}

      Sections: Overview, Features, Architecture, File Structure, Implementation Plan.
      Output the markdown content.
    `;

    try {
      console.log('[ProjectPlanner] Generating Plan...', prompt);
      // في تطبيق حقيقي، سيتم استدعاء LLM هنا. حالياً نعيد الهيكل المقترح.
      return `# خطة المشروع: ${description}\n\n## المعماريّة المقترحة\n- التقنيات: ${techStack.join(', ')}\n\n## خطوات التنفيذ\n1. إعداد البيئة الأساسية\n2. بناء المكونات الرئيسية\n3. الربط البرمجي\n`;
    } catch (error) {
      console.error('Failed to generate project plan:', error);
      toast.error('فشل في توليد خطة المشروع');
      throw error;
    }
  }

  /**
   * توليد توثيق المعمارية للمشروع الحالي
   */
  async generateArchitectureDocs(files: string[]): Promise<string> {
    const fileList = files.join('\n');

    const prompt = `
      Analyze these files and generate ARCHITECTURE.md:
      ${fileList}
    `;

    try {
      console.log('[ProjectPlanner] Generating Architecture Docs...', prompt);
      return `# توثيق معمارية المشروع\n\n## هيكل الملفات الحالي\n${fileList.substring(0, 500)}...\n\n## المكونات الأساسية\nيتم تحليل المكونات بناءً على الملفات المذكورة أعلاه.`;
    } catch (error) {
      console.error('Failed to generate architecture docs:', error);
      toast.error('فشل في توليد توثيق المعمارية');
      throw error;
    }
  }
}

export const projectPlanner = new ProjectPlanner();
