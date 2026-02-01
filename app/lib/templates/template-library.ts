/**
 * 📁 ملف: template-library.ts
 * 📝 وصف: مكتبة القوالب الجاهزة لمنصة yousef sh
 * 🔧 الغرض: توفير هياكل مشاريع جاهزة للبدء السريع
 */

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  tags: string[];
  githubRepo?: string;
  files?: Record<string, string>;
}

export const templateLibrary: ProjectTemplate[] = [
  {
    id: 'react-typescript',
    name: 'React + TypeScript',
    description: 'تطبيق React حديث مع TypeScript و Vite',
    icon: '⚛️',
    tags: ['react', 'typescript', 'vite'],
    githubRepo: 'xKevIsDev/bolt-vite-react-ts-template',
  },
  {
    id: 'nextjs-app',
    name: 'Next.js App Router',
    description: 'تطبيق Next.js 14 مع App Router و Tailwind',
    icon: '▲',
    tags: ['nextjs', 'react', 'typescript', 'tailwind'],
    githubRepo: 'xKevIsDev/bolt-nextjs-shadcn-template',
  },
  {
    id: 'vue-composition',
    name: 'Vue 3 Composition API',
    description: 'تطبيق Vue 3 مع Composition API و Vite',
    icon: '💚',
    tags: ['vue', 'typescript', 'vite'],
    githubRepo: 'xKevIsDev/bolt-vue-template',
  },
  {
    id: 'expo-mobile',
    name: 'Expo Mobile App',
    description: 'تطبيق موبايل متقاطع المنصات باستخدام Expo',
    icon: '📱',
    tags: ['mobile', 'expo', 'react-native'],
    githubRepo: 'xKevIsDev/bolt-expo-template',
  }
];

export const getTemplateById = (id: string) => templateLibrary.find(t => t.id === id);
export const searchTemplates = (query: string) =>
  templateLibrary.filter(t =>
    t.name.toLowerCase().includes(query.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  );
