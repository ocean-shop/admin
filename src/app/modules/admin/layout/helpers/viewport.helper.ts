import { LAYOUT_COMPACT_SIDEBAR_BREAKPOINT } from '../constants/layout.constants';

/** True on screens where the sidebar overlays the content; false outside the browser. */
export const isCompactScreen = (): boolean =>
  typeof window !== 'undefined' && window.innerWidth < LAYOUT_COMPACT_SIDEBAR_BREAKPOINT;
