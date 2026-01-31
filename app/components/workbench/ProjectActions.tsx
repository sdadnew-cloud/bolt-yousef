import React, { useState } from 'react';
import { Button } from '~/components/ui/Button';
import { projectPlannerAgent } from '~/lib/agents/project-planner';
import { workbenchStore } from '~/lib/stores/workbench';
import { toast } from 'react-toastify';
import { useStore } from '@nanostores/react';

interface ProjectActionsProps {
  onSendMessage?: (message: string) => void;
}

export const ProjectActions: React.FC<ProjectActionsProps> = ({ onSendMessage }) => {
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [isGeneratingArch, setIsGeneratingArch] = useState(false);
  const files = useStore(workbenchStore.files);

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);

    try {
      // In a real scenario, we'd gather info from the current session
      const description = 'Current project under development';
      const techStack = ['React', 'TypeScript', 'Tailwind'];

      const prompt = await projectPlannerAgent.generateProjectPlan({ description, techStack });

      if (onSendMessage) {
        onSendMessage(prompt);
      } else {
        // Fallback: update chat input or send directly if possible
        toast.info('تم إنشاء مطالبة خطة المشروع. أرسلها للذكاء الاصطناعي.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleGenerateArchitecture = async () => {
    setIsGeneratingArch(true);

    try {
      const prompt = await projectPlannerAgent.generateArchitectureDocs(files);

      if (onSendMessage) {
        onSendMessage(prompt);
      } else {
        toast.info('تم إنشاء مطالبة مستند المعمارية. أرسلها للذكاء الاصطناعي.');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGeneratingArch(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleGeneratePlan}
        isLoading={isGeneratingPlan}
        leftIcon={<div className="i-ph:notebook" />}
      >
        توليد خطة المشروع
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleGenerateArchitecture}
        isLoading={isGeneratingArch}
        leftIcon={<div className="i-ph:tree-structure" />}
      >
        توليد مستند المعمارية
      </Button>
    </div>
  );
};
