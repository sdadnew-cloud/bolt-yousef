import { PROMPT_PRESETS, PROVIDER_SPECIFIC_PROMPTS, type PromptPreset } from './presets';

export class PromptManager {
  static getPreset(name: string): PromptPreset {
    return PROMPT_PRESETS[name] || PROMPT_PRESETS.codeGeneration;
  }

  static enhanceSystemPrompt(basePrompt: string, provider: string, presetName?: string): string {
    let enhancedPrompt = basePrompt;

    // Add preset specific instructions
    if (presetName) {
      const preset = this.getPreset(presetName);
      enhancedPrompt = `${preset.systemPrompt}\n\n${enhancedPrompt}`;
    }

    // Add provider specific instructions
    const providerKey = provider.toLowerCase();
    const providerConfig = PROVIDER_SPECIFIC_PROMPTS[providerKey];

    if (providerConfig) {
      enhancedPrompt = `${providerConfig.prefix}\n${providerConfig.format || ''}\n\n${enhancedPrompt}`;
    }

    return enhancedPrompt;
  }
}
