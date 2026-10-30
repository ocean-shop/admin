import { LAYOUT_COMPACT_SIDEBAR_BREAKPOINT } from '../../constants/layout.constants';
import { isCompactScreen } from './viewport.helper';

describe('viewport.helper', () => {
  const setWidth = (value: number): void => {
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value });
  };

  it('is compact below the sidebar breakpoint', () => {
    setWidth(LAYOUT_COMPACT_SIDEBAR_BREAKPOINT - 1);
    expect(isCompactScreen()).toBe(true);
  });

  it('is not compact from the breakpoint on', () => {
    setWidth(LAYOUT_COMPACT_SIDEBAR_BREAKPOINT);
    expect(isCompactScreen()).toBe(false);
  });
});
