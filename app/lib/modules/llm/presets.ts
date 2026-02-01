export interface PromptPreset {
  name: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export const PROMPT_PRESETS: Record<string, PromptPreset> = {
  codeGeneration: {
    name: 'codeGeneration',
    systemPrompt: 'أنت مساعد برمجة خبير. ركز على كتابة كود نظيف وقابل للصيانة واتباع أفضل الممارسات.',
    temperature: 0.7,
    maxTokens: 4096,
  },
  debug: {
    name: 'debug',
    systemPrompt: 'أنت خبير في تصحيح الأخطاء. ركز على تحديد السبب الجذري للمشكلة واقتراح حلول دقيقة.',
    temperature: 0.3,
    maxTokens: 2048,
  },
  refactor: {
    name: 'refactor',
    systemPrompt: 'أنت خبير في إعادة هيكلة الكود. ركز على تحسين القراءة والأداء وتبسيط المنطق المعقد.',
    temperature: 0.5,
    maxTokens: 4096,
  },
};

export const PROVIDER_SPECIFIC_PROMPTS: Record<string, { prefix: string; format?: string }> = {
  anthropic: {
    prefix: 'You are Claude, an AI assistant by Anthropic.',
    format: 'Think step by step.',
  },
  openai: {
    prefix: 'You are GPT, a helpful coding assistant by OpenAI.',
    format: 'Provide concise and accurate responses.',
  },
  deepseek: {
    prefix: 'You are DeepSeek Coder, an expert in programming.',
    format: 'Focus on code quality and performance.',
  },
};
