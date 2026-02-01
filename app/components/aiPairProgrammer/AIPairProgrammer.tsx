import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('AIPairProgrammer');

export interface ReasoningStep {
  id: string;
  type: 'thought' | 'plan' | 'code' | 'debug' | 'optimization';
  content: string;
  timestamp: number;
  duration?: number;
  completed: boolean;
}

interface AIPairProgrammerProps {
  isActive: boolean;
  onStop?: () => void;
}

export const AIPairProgrammer = ({ isActive, onStop }: AIPairProgrammerProps) => {
  const [reasoningSteps, setReasoningSteps] = useState<ReasoningStep[]>([]);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [currentPlan, setCurrentPlan] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const reasoningRef = useRef<ReasoningStep[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new steps are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [reasoningSteps]);

  // Simulate reasoning process
  useEffect(() => {
    if (!isActive) {
      return;
    }

    setIsThinking(true);
    setProgress(0);

    // Simulate initial thinking
    const initialTimer = setTimeout(() => {
      const firstStep: ReasoningStep = {
        id: `step-${Date.now()}`,
        type: 'thought',
        content:
          'I need to understand the current codebase structure first and analyze Android-specific requirements...',
        timestamp: Date.now(),
        completed: false,
      };

      reasoningRef.current.push(firstStep);
      setReasoningSteps([...reasoningRef.current]);
      setProgress(10);
    }, 500);

    // Simulate plan creation
    const planTimer = setTimeout(() => {
      const planStep: ReasoningStep = {
        id: `step-${Date.now()}`,
        type: 'plan',
        content:
          '1. Analyze Android Material Design 3 guidelines\n2. Identify key components and responsive requirements\n3. Design implementation approach with Android-specific features\n4. Write and test code with Android device emulation\n5. Optimize for Android performance and responsiveness',
        timestamp: Date.now(),
        completed: false,
      };

      reasoningRef.current.push(planStep);
      setReasoningSteps([...reasoningRef.current]);
      setCurrentPlan(planStep.content);
      setProgress(25);
    }, 2000);

    // Simulate code writing
    const codeTimer = setTimeout(() => {
      const codeStep: ReasoningStep = {
        id: `step-${Date.now()}`,
        type: 'code',
        content:
          'Implementing Android Material Design 3 components...\n- Creating responsive layouts\n- Adding Android-style animations\n- Implementing touch-friendly interactions\n- Ensuring proper contrast ratios',
        timestamp: Date.now(),
        completed: false,
      };

      reasoningRef.current.push(codeStep);
      setReasoningSteps([...reasoningRef.current]);
      setProgress(50);
    }, 4000);

    // Simulate Android-specific debugging
    const debugTimer = setTimeout(() => {
      const debugStep: ReasoningStep = {
        id: `step-${Date.now()}`,
        type: 'debug',
        content:
          'Testing Android-specific functionality...\n- Checking responsive behavior on various Android devices\n- Verifying touch interaction responsiveness\n- Testing performance on low-end Android devices\n- Ensuring Material Design 3 compliance',
        timestamp: Date.now(),
        completed: false,
      };

      reasoningRef.current.push(debugStep);
      setReasoningSteps([...reasoningRef.current]);
      setProgress(75);
    }, 6000);

    // Simulate Android-specific optimization
    const optimizeTimer = setTimeout(() => {
      const optimizeStep: ReasoningStep = {
        id: `step-${Date.now()}`,
        type: 'optimization',
        content:
          'Optimizing for Android performance...\n- Reducing render times for Android devices\n- Optimizing image loading and caching\n- Implementing efficient state management\n- Ensuring smooth animations at 60fps',
        timestamp: Date.now(),
        completed: false,
      };

      reasoningRef.current.push(optimizeStep);
      setReasoningSteps([...reasoningRef.current]);
      setProgress(90);
    }, 8000);

    // Complete the process
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setIsThinking(false);

      setReasoningSteps((prev) => prev.map((step) => ({ ...step, completed: true })));
    }, 10000);

    return () => {
      clearTimeout(initialTimer);
      clearTimeout(planTimer);
      clearTimeout(codeTimer);
      clearTimeout(debugTimer);
      clearTimeout(optimizeTimer);
      clearTimeout(completeTimer);
    };
  }, [isActive]);

  const handleStop = () => {
    setIsThinking(false);
    setReasoningSteps((prev) => prev.map((step) => ({ ...step, completed: true })));
    onStop?.();
  };

  const clearReasoning = () => {
    reasoningRef.current = [];
    setReasoningSteps([]);
    setCurrentPlan('');
    setProgress(0);
  };

  const getTypeIcon = (type: ReasoningStep['type']) => {
    switch (type) {
      case 'thought':
        return 'i-ph:brain';
      case 'plan':
        return 'i-ph:list';
      case 'code':
        return 'i-ph:code';
      case 'debug':
        return 'i-ph:bug';
      case 'optimization':
        return 'i-ph:zap';
    }
  };

  const getTypeColor = (type: ReasoningStep['type']) => {
    switch (type) {
      case 'thought':
        return 'text-blue-500';
      case 'plan':
        return 'text-green-500';
      case 'code':
        return 'text-purple-500';
      case 'debug':
        return 'text-yellow-500';
      case 'optimization':
        return 'text-red-500';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="flex flex-col h-full bg-bolt-elements-background-depth-1 rounded-lg border border-bolt-elements-borderColor">
      {/* Header */}
      <div className="p-4 border-b border-bolt-elements-borderColor">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-bolt-elements-textPrimary">AI Pair Programmer</h3>
          <div className="flex items-center gap-2">
            {isThinking ? (
              <button
                onClick={handleStop}
                className="px-3 py-1.5 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                <i className="i-ph:stop mr-1"></i>
                Stop
              </button>
            ) : (
              <button
                onClick={clearReasoning}
                className="px-3 py-1.5 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={reasoningSteps.length === 0}
              >
                <i className="i-ph:trash mr-1"></i>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {isThinking && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-bolt-elements-textSecondary mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-bolt-elements-background-depth-2 rounded-full h-2 overflow-hidden">
              <motion.div
                className="bg-bolt-elements-primary h-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Reasoning Stream */}
      <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
        {reasoningSteps.length === 0 && !isThinking && (
          <div className="text-center py-8 text-bolt-elements-textTertiary">
            <i className="i-ph:robot text-4xl mb-2"></i>
            <p>AI Pair Programmer ready</p>
            <p className="text-sm mt-1">Start coding to see real-time reasoning</p>
          </div>
        )}

        <AnimatePresence>
          {reasoningSteps.map((step) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={`p-3 rounded-lg border ${
                step.completed
                  ? 'bg-bolt-elements-background-depth-2 border-bolt-elements-borderColor'
                  : 'bg-blue-50 border-blue-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <i className={`${getTypeIcon(step.type)} ${getTypeColor(step.type)} text-lg`}></i>
                <span className="text-sm font-medium text-bolt-elements-textPrimary">
                  {step.type.charAt(0).toUpperCase() + step.type.slice(1)}
                </span>
                <span className="text-xs text-bolt-elements-textSecondary">{formatTime(step.timestamp)}</span>
                {!step.completed && <div className="i-ph:spinner animate-spin text-sm text-blue-500"></div>}
              </div>

              <div className="text-sm text-bolt-elements-textSecondary whitespace-pre-wrap">{step.content}</div>

              {step.duration && (
                <div className="text-xs text-bolt-elements-textTertiary mt-1">Duration: {step.duration}ms</div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-bolt-elements-textSecondary">
            <div className="i-ph:spinner animate-spin"></div>
            <span className="text-sm">AI is thinking...</span>
          </div>
        )}
      </div>

      {/* Current Plan */}
      {currentPlan && (
        <div className="p-3 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
          <div className="flex items-center gap-2 mb-2">
            <i className="i-ph:list text-green-500"></i>
            <span className="text-sm font-medium text-bolt-elements-textPrimary">Current Plan</span>
          </div>
          <div className="text-sm text-bolt-elements-textSecondary whitespace-pre-wrap">{currentPlan}</div>
        </div>
      )}

      {/* Footer Stats */}
      {reasoningSteps.length > 0 && (
        <div className="p-3 border-t border-bolt-elements-borderColor bg-bolt-elements-background-depth-2">
          <div className="flex items-center gap-4 text-xs text-bolt-elements-textSecondary">
            <span>Steps: {reasoningSteps.length}</span>
            <span>Active: {reasoningSteps.filter((step) => !step.completed).length}</span>
            <span>Completed: {reasoningSteps.filter((step) => step.completed).length}</span>
          </div>
        </div>
      )}
    </div>
  );
};
