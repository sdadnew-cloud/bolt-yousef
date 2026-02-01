import React, { useState } from 'react';
import { Card } from '~/components/ui/Card';
import { Input } from '~/components/ui/Input';
import { templateLibrary, type ProjectTemplate } from '~/lib/templates/template-library';

interface TemplateSelectorProps {
  onSelect: (template: ProjectTemplate) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(templateLibrary.flatMap((t) => t.tags)));

  const filteredTemplates = templateLibrary.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) || t.description.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || t.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col gap-6 p-4 max-w-6xl mx-auto">
      <header className="text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-bolt-elements-textPrimary">ابدأ مشروعك الجديد</h2>
        <p className="text-bolt-elements-textSecondary">اختر من بين مجموعة من القوالب الجاهزة والمحسنة</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-96">
          <Input
            placeholder="بحث عن قوالب..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              !selectedTag ? 'bg-accent-500 text-white' : 'bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-4'
            }`}
          >
            الكل
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
                selectedTag === tag ? 'bg-accent-500 text-white' : 'bg-bolt-elements-background-depth-3 text-bolt-elements-textSecondary hover:bg-bolt-elements-background-depth-4'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card
            key={template.id}
            className="p-6 flex flex-col gap-4 hover:border-accent-500 transition-colors cursor-pointer group"
            onClick={() => onSelect(template)}
          >
            <div className="flex items-center gap-4">
              <div className="text-4xl group-hover:scale-110 transition-transform">{template.icon}</div>
              <div className="flex flex-col">
                <h3 className="text-lg font-bold text-bolt-elements-textPrimary">{template.name}</h3>
                <div className="flex gap-1">
                  {template.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-[10px] text-bolt-elements-textTertiary uppercase tracking-wider">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-sm text-bolt-elements-textSecondary line-clamp-2">{template.description}</p>
            <div className="mt-auto pt-4 flex justify-end">
              <span className="text-xs font-bold text-accent-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                استخدام هذا القالب <div className="i-ph:arrow-right" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-20 bg-bolt-elements-background-depth-2 rounded-xl border border-dashed border-bolt-elements-borderColor">
          <div className="i-ph:magnifying-glass text-4xl mx-auto mb-2 opacity-20" />
          <p className="text-bolt-elements-textSecondary">لم يتم العثور على قوالب تطابق بحثك</p>
        </div>
      )}
    </div>
  );
};
