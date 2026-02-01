import React, { useState } from 'react';
import { Card } from '~/components/ui/Card';
import { Button } from '~/components/ui/Button';
import { projectPlanner } from '~/lib/agents/project-planner';
import { workbenchStore } from '~/lib/stores/workbench';
import { useStore } from '@nanostores/react';
import { toast } from 'react-toastify';

interface ProjectActionsProps {
  onSendMessage?: (message: string) => void;
}

export const ProjectActions: React.FC<ProjectActionsProps> = ({ onSendMessage: _onSendMessage }) => {
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const files = useStore(workbenchStore.files);

  const handleGeneratePlan = async () => {
    try {
      setLoadingPlan(true);
      const plan = await projectPlanner.generateProjectPlan('تحليل المشروع الحالي', ['react', 'typescript']);

      // حفظ الخطة في ملف حقيقي
      await workbenchStore.createFile('PROJECT_PLAN.md', plan);
      toast.success('تم توليد خطة المشروع بنجاح!');
    } catch (error) {
      console.error(error);
      toast.error('فشل في توليد الخطة.');
    } finally {
      setLoadingPlan(false);
    }
  };

  const handleGenerateDocs = async () => {
    try {
      setLoadingDocs(true);
      const docs = await projectPlanner.generateArchitectureDocs(Object.keys(files));

      // حفظ التوثيق في ملف حقيقي
      await workbenchStore.createFile('ARCHITECTURE.md', docs);
      toast.success('تم توليد توثيق المعمارية بنجاح!');
    } catch (error) {
      console.error(error);
      toast.error('فشل في توليد التوثيق.');
    } finally {
      setLoadingDocs(false);
    }
  };

  return (
    <Card className="p-4 flex gap-4 bg-bolt-elements-background-depth-3 border-t border-bolt-elements-borderColor rounded-none">
      <Button
        variant="outline"
        size="sm"
        onClick={handleGeneratePlan}
        className="flex items-center gap-2"
      >
        {loadingPlan ? (
          <div className="i-ph:spinner animate-spin" />
        ) : (
          <div className="i-ph:clipboard-text-duotone" />
        )}
        توليد خطة المشروع
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateDocs}
        className="flex items-center gap-2"
      >
        {loadingDocs ? (
          <div className="i-ph:spinner animate-spin" />
        ) : (
          <div className="i-ph:book-open-duotone" />
        )}
        توليد توثيق المعمارية
      </Button>
    </Card>
  );
};
