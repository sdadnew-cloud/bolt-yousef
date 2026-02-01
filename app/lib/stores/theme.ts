import { atom } from 'nanostores';
import { logStore } from './logs';
import { type DesignScheme, defaultDesignScheme } from '~/types/design-scheme';

export type Theme = 'dark' | 'light';

export const kTheme = 'bolt_theme';
export const kDesignScheme = 'bolt_design_scheme';

export function themeIsDark() {
  return themeStore.get() === 'dark';
}

export const DEFAULT_THEME = 'light';

export const themeStore = atom<Theme>(initStore());

function initStore() {
  if (!import.meta.env.SSR) {
    const persistedTheme = localStorage.getItem(kTheme) as Theme | undefined;
    const themeAttribute = document.querySelector('html')?.getAttribute('data-theme');

    return persistedTheme ?? (themeAttribute as Theme) ?? DEFAULT_THEME;
  }

  return DEFAULT_THEME;
}

export function toggleTheme() {
  const currentTheme = themeStore.get();
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  // Update the theme store
  themeStore.set(newTheme);

  // Update localStorage
  localStorage.setItem(kTheme, newTheme);

  // Update the HTML attribute
  document.querySelector('html')?.setAttribute('data-theme', newTheme);

  // Update user profile if it exists
  try {
    const userProfile = localStorage.getItem('bolt_user_profile');

    if (userProfile) {
      const profile = JSON.parse(userProfile);
      profile.theme = newTheme;
      localStorage.setItem('bolt_user_profile', JSON.stringify(profile));
    }
  } catch (error) {
    console.error('Error updating user profile theme:', error);
  }

  logStore.logSystem(`Theme changed to ${newTheme} mode`);
}

/**
 * Loads and applies the custom design scheme from localStorage
 */
export function applyDesignScheme() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const designSchemeStr = localStorage.getItem(kDesignScheme);
    const designScheme: DesignScheme = designSchemeStr ? JSON.parse(designSchemeStr) : defaultDesignScheme;

    applyDesignSchemeToDOM(designScheme);
  } catch (error) {
    console.error('Error applying design scheme:', error);

    // Fallback to default scheme
    applyDesignSchemeToDOM(defaultDesignScheme);
  }
}

/**
 * Applies the design scheme to the DOM by setting CSS variables
 */
function applyDesignSchemeToDOM(scheme: DesignScheme) {
  const root = document.documentElement;

  // Apply palette colors as CSS variables
  Object.entries(scheme.palette).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Apply font family
  root.style.setProperty('--font-family', scheme.font.join(', ') || 'system-ui, sans-serif');

  /*
   * Apply feature-related CSS classes
   * Clear previous feature classes
   */
  root.classList.remove('rounded-corners', 'subtle-borders', 'gradient-accent', 'soft-shadow', 'frosted-glass');

  // Add current feature classes
  if (scheme.features.includes('rounded')) {
    root.classList.add('rounded-corners');
  }

  if (scheme.features.includes('border')) {
    root.classList.add('subtle-borders');
  }

  if (scheme.features.includes('gradient')) {
    root.classList.add('gradient-accent');
  }

  if (scheme.features.includes('shadow')) {
    root.classList.add('soft-shadow');
  }

  if (scheme.features.includes('frosted-glass')) {
    root.classList.add('frosted-glass');
  }
}

/**
 * Initializes the design scheme application and sets up event listeners
 */
export function initDesignScheme() {
  // Apply the design scheme when the page loads
  if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', applyDesignScheme);
    } else {
      applyDesignScheme();
    }

    // Listen for design scheme changes from other components
    window.addEventListener('designSchemeChanged', (e: any) => {
      if (e.detail) {
        applyDesignSchemeToDOM(e.detail);
      }
    });
  }
}

// Initialize the design scheme when module loads
if (typeof window !== 'undefined') {
  initDesignScheme();
}
