import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('NicheAgents');

export interface NicheAgent {
  id: string;
  name: string;
  description: string;
  avatar: string;
  expertise: string[];
  systemPrompt: string;
  defaultModel: string;
  isPremium?: boolean;
  popularity?: number;
}

export const nicheAgents: NicheAgent[] = [
  {
    id: 'general',
    name: 'General Developer',
    description: 'All-around AI assistant for general development tasks',
    avatar: 'i-ph:code',
    expertise: ['General Development', 'Web Development', 'Debugging', 'Code Review'],
    systemPrompt: 'You are a skilled full-stack developer with expertise in modern web technologies. You excel at writing clean, maintainable code and solving complex problems. Provide comprehensive solutions with explanations.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'cybersecurity',
    name: 'Cybersecurity Expert',
    description: 'Specialized in vulnerability detection and security best practices',
    avatar: 'i-ph:shield',
    expertise: ['Security Audits', 'Vulnerability Scanning', 'Penetration Testing', 'Security Best Practices'],
    systemPrompt: 'You are a cybersecurity expert with extensive knowledge of web vulnerabilities, security best practices, and penetration testing. Analyze code for security flaws, identify vulnerabilities, and suggest fixes. Focus on common issues like XSS, SQL injection, CSRF, and insecure authentication.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'ux-ui',
    name: 'UI/UX Designer',
    description: 'Expert in user interface and user experience design',
    avatar: 'i-ph:paint-brush',
    expertise: ['UI Design', 'UX Research', 'Responsive Design', 'Accessibility'],
    systemPrompt: 'You are a UI/UX designer with expertise in creating beautiful, accessible, and user-friendly interfaces. Focus on design systems, responsive layouts, accessibility (WCAG guidelines), and modern design trends. Provide detailed CSS and design recommendations.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'database',
    name: 'Database Expert',
    description: 'Specialized in SQL, NoSQL databases, and data modeling',
    avatar: 'i-ph:database',
    expertise: ['SQL', 'Database Design', 'Data Modeling', 'Performance Optimization'],
    systemPrompt: 'You are a database expert with deep knowledge of SQL, NoSQL databases, and data modeling. Design efficient database schemas, optimize queries, and provide recommendations for data storage solutions. Focus on performance, scalability, and best practices.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'devops',
    name: 'DevOps Engineer',
    description: 'Expert in CI/CD, cloud infrastructure, and deployment',
    avatar: 'i-ph:cloud',
    expertise: ['CI/CD', 'Docker', 'Kubernetes', 'Cloud Infrastructure'],
    systemPrompt: 'You are a DevOps engineer with expertise in CI/CD pipelines, cloud infrastructure, Docker, Kubernetes, and deployment automation. Provide recommendations for infrastructure as code, containerization, and continuous integration/delivery best practices.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'mobile',
    name: 'Mobile Developer',
    description: 'Specialized in mobile app development (iOS/Android)',
    avatar: 'i-ph:smartphone',
    expertise: ['React Native', 'Flutter', 'iOS', 'Android'],
    systemPrompt: 'You are a mobile app developer with expertise in React Native, Flutter, iOS, and Android development. Focus on mobile-specific features, responsive design, performance optimization, and app store guidelines.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'ai-ml',
    name: 'AI/ML Specialist',
    description: 'Expert in artificial intelligence and machine learning',
    avatar: 'i-ph:brain',
    expertise: ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch'],
    systemPrompt: 'You are an AI/ML specialist with expertise in machine learning, deep learning, and data science. Assist with model development, data analysis, and implementing AI solutions. Focus on best practices in ML engineering.',
    defaultModel: 'gpt-4o'
  },
  {
    id: 'performance',
    name: 'Performance Expert',
    description: 'Specialized in optimizing application performance',
    avatar: 'i-ph:speedometer',
    expertise: ['Performance Optimization', 'Load Testing', 'Profiling', 'Web Vitals'],
    systemPrompt: 'You are a performance optimization expert. Analyze code for performance bottlenecks, suggest optimizations, and help improve application speed. Focus on web vitals, load times, and resource optimization.',
    defaultModel: 'gpt-4o'
  }
];

export class NicheAgentsService {
  private static _instance: NicheAgentsService;
  private _selectedAgentId: string = 'general';

  static getInstance(): NicheAgentsService {
    if (!NicheAgentsService._instance) {
      NicheAgentsService._instance = new NicheAgentsService();
    }
    return NicheAgentsService._instance;
  }

  /**
   * Get all available niche agents
   */
  getAgents(): NicheAgent[] {
    return nicheAgents;
  }

  /**
   * Get a specific agent by ID
   */
  getAgentById(id: string): NicheAgent | undefined {
    return nicheAgents.find(agent => agent.id === id);
  }

  /**
   * Get currently selected agent
   */
  getSelectedAgent(): NicheAgent {
    return this.getAgentById(this._selectedAgentId) || nicheAgents[0];
  }

  /**
   * Set selected agent
   */
  setSelectedAgent(id: string): void {
    const agent = this.getAgentById(id);
    if (agent) {
      this._selectedAgentId = id;
      logger.info(`Selected agent: ${agent.name}`);
    }
  }

  /**
   * Get agent recommendations based on project type
   */
  getRecommendedAgents(projectType?: string): NicheAgent[] {
    const recommendations: NicheAgent[] = [];
    
    if (projectType?.includes('react') || projectType?.includes('web')) {
      recommendations.push(
        this.getAgentById('general')!,
        this.getAgentById('ux-ui')!,
        this.getAgentById('performance')!
      );
    } else if (projectType?.includes('mobile')) {
      recommendations.push(
        this.getAgentById('mobile')!,
        this.getAgentById('general')!
      );
    } else if (projectType?.includes('backend') || projectType?.includes('api')) {
      recommendations.push(
        this.getAgentById('general')!,
        this.getAgentById('database')!
      );
    } else if (projectType?.includes('ai') || projectType?.includes('ml')) {
      recommendations.push(
        this.getAgentById('ai-ml')!,
        this.getAgentById('general')!
      );
    } else {
      recommendations.push(this.getAgentById('general')!);
    }
    
    return recommendations.filter((agent, index, self) => 
      index === self.findIndex(a => a.id === agent.id)
    );
  }

  /**
   * Search agents by name or expertise
   */
  searchAgents(query: string): NicheAgent[] {
    const lowerQuery = query.toLowerCase();
    
    return nicheAgents.filter(agent => 
      agent.name.toLowerCase().includes(lowerQuery) ||
      agent.description.toLowerCase().includes(lowerQuery) ||
      agent.expertise.some(exp => exp.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Get agents by expertise
   */
  getAgentsByExpertise(expertise: string): NicheAgent[] {
    return nicheAgents.filter(agent => 
      agent.expertise.some(exp => exp.toLowerCase().includes(expertise.toLowerCase()))
    );
  }

  /**
   * Get most popular agents
   */
  getPopularAgents(limit: number = 5): NicheAgent[] {
    return [...nicheAgents]
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit);
  }
}

export const nicheAgentsService = NicheAgentsService.getInstance();