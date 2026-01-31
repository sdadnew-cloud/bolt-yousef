/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 📁 ملف: use-media-query.ts
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * 📝 وصف: Hook للاستعلامات عن الوسائط والشاشة
 * 🔧 الغرض: التعامل مع نقاط التوقف والشاشات المختلفة
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useMemo } from 'react';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🎯 أنواع البيانات
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface BreakpointValues {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

export const defaultBreakpoints: BreakpointValues = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useMediaQuery
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const media = window.matchMedia(query);

    const updateMatch = (event: MediaQueryListEvent | MediaQueryList) => {
      setMatches('matches' in event ? event.matches : false);
    };

    // التحقق الأولي
    updateMatch(media);

    // الاستماع للتغييرات
    if (media.addEventListener) {
      media.addEventListener('change', updateMatch);
      return () => media.removeEventListener('change', updateMatch);
    } else {
      // دعم المتصفحات القديمة
      media.addListener(updateMatch);
      return () => media.removeListener(updateMatch);
    }
  }, [query]);

  return matches;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useBreakpoint
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useBreakpoint(breakpoints: Partial<BreakpointValues> = {}): Breakpoint {
  const mergedBreakpoints = useMemo(
    () => ({
      ...defaultBreakpoints,
      ...breakpoints,
    }),
    [breakpoints],
  );

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('xs');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= mergedBreakpoints['2xl']) {
        setCurrentBreakpoint('2xl');
      } else if (width >= mergedBreakpoints.xl) {
        setCurrentBreakpoint('xl');
      } else if (width >= mergedBreakpoints.lg) {
        setCurrentBreakpoint('lg');
      } else if (width >= mergedBreakpoints.md) {
        setCurrentBreakpoint('md');
      } else if (width >= mergedBreakpoints.sm) {
        setCurrentBreakpoint('sm');
      } else {
        setCurrentBreakpoint('xs');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, [mergedBreakpoints]);

  return currentBreakpoint;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useIsMobile
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useIsMobile(breakpoint: number = 768): boolean {
  return useMediaQuery(`(max-width: ${breakpoint - 1}px)`);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useIsTablet
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useIsTablet(minBreakpoint: number = 768, maxBreakpoint: number = 1024): boolean {
  return useMediaQuery(`(min-width: ${minBreakpoint}px) and (max-width: ${maxBreakpoint - 1}px)`);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useIsDesktop
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useIsDesktop(breakpoint: number = 1024): boolean {
  return useMediaQuery(`(min-width: ${breakpoint}px)`);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useScreenSize
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export interface ScreenSize {
  width: number;
  height: number;
}

export function useScreenSize(): ScreenSize {
  const [size, setSize] = useState<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useOrientation
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type Orientation = 'portrait' | 'landscape';

export function useOrientation(): Orientation {
  const isPortrait = useMediaQuery('(orientation: portrait)');
  return isPortrait ? 'portrait' : 'landscape';
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: usePrefersColorScheme
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type ColorScheme = 'light' | 'dark';

export function usePrefersColorScheme(): ColorScheme {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  return prefersDark ? 'dark' : 'light';
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: usePrefersReducedMotion
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useHover
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useHover(): {
  ref: (element: HTMLElement | null) => void;
  isHovered: boolean;
} {
  const [isHovered, setIsHovered] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) {
      return;
    }

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [element]);

  return { ref: setElement, isHovered };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useFocus
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useFocus(): {
  ref: (element: HTMLElement | null) => void;
  isFocused: boolean;
} {
  const [isFocused, setIsFocused] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) {
      return;
    }

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    element.addEventListener('focus', handleFocus);
    element.addEventListener('blur', handleBlur);

    return () => {
      element.removeEventListener('focus', handleFocus);
      element.removeEventListener('blur', handleBlur);
    };
  }, [element]);

  return { ref: setElement, isFocused };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useActive
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useActive(): {
  ref: (element: HTMLElement | null) => void;
  isActive: boolean;
} {
  const [isActive, setIsActive] = useState(false);
  const [element, setElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!element) {
      return;
    }

    const handleMouseDown = () => setIsActive(true);
    const handleMouseUp = () => setIsActive(false);
    const handleTouchStart = () => setIsActive(true);
    const handleTouchEnd = () => setIsActive(false);

    element.addEventListener('mousedown', handleMouseDown);
    element.addEventListener('mouseup', handleMouseUp);
    element.addEventListener('mouseleave', handleMouseUp);
    element.addEventListener('touchstart', handleTouchStart);
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('mousedown', handleMouseDown);
      element.removeEventListener('mouseup', handleMouseUp);
      element.removeEventListener('mouseleave', handleMouseUp);
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [element]);

  return { ref: setElement, isActive };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useResponsiveValue
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T {
  const breakpoint = useBreakpoint();

  const orderedBreakpoints: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];

  for (const bp of orderedBreakpoints) {
    if (orderedBreakpoints.indexOf(bp) <= orderedBreakpoints.indexOf(breakpoint)) {
      if (values[bp] !== undefined) {
        return values[bp] as T;
      }
    }
  }

  return defaultValue;
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: usePrint
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function usePrint(): boolean {
  return useMediaQuery('print');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: useTouch
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export function useTouch(): boolean {
  return useMediaQuery('(hover: none) and (pointer: coarse)');
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🪝 Hook: usePointer
 * ═══════════════════════════════════════════════════════════════════════════════
 */

export type PointerType = 'fine' | 'coarse' | 'none';

export function usePointer(): PointerType {
  const hasFine = useMediaQuery('(pointer: fine)');
  const hasCoarse = useMediaQuery('(pointer: coarse)');

  if (hasFine) {
    return 'fine';
  }

  if (hasCoarse) {
    return 'coarse';
  }

  return 'none';
}
