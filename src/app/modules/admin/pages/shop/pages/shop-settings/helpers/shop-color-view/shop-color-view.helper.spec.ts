import {
  SHOP_COLOR_GROUPS,
  SHOP_CONTRAST_PAIRS,
  SHOP_DEFAULT_COLOR_SCHEME,
  SHOP_SETTINGS_TEXTS,
} from '../../constants/shop-settings.constants';
import {
  buildColorGroupViews,
  buildContrastRows,
  buildPreviewCssVars,
  formatColorUsageLabel,
} from './shop-color-view.helper';

describe('shop color view helper', () => {
  describe('formatColorUsageLabel', () => {
    it('uses the "few" form for 1–4 outside the teens', () => {
      expect(formatColorUsageLabel(1)).toBe(`1 ${SHOP_SETTINGS_TEXTS.USAGE_FEW}`);
      expect(formatColorUsageLabel(82)).toBe(`82 ${SHOP_SETTINGS_TEXTS.USAGE_FEW}`);
      expect(formatColorUsageLabel(134)).toBe(`134 ${SHOP_SETTINGS_TEXTS.USAGE_FEW}`);
    });

    it('uses the "many" form for 0, 5–9 and 11–14', () => {
      expect(formatColorUsageLabel(0)).toBe(`0 ${SHOP_SETTINGS_TEXTS.USAGE_MANY}`);
      expect(formatColorUsageLabel(8)).toBe(`8 ${SHOP_SETTINGS_TEXTS.USAGE_MANY}`);
      expect(formatColorUsageLabel(12)).toBe(`12 ${SHOP_SETTINGS_TEXTS.USAGE_MANY}`);
      expect(formatColorUsageLabel(114)).toBe(`114 ${SHOP_SETTINGS_TEXTS.USAGE_MANY}`);
    });
  });

  describe('buildColorGroupViews', () => {
    it('builds every group and row with labels and the changed flag', () => {
      const colors = { ...SHOP_DEFAULT_COLOR_SCHEME, accent: '#123456', muted: 'bad' };
      const groups = buildColorGroupViews(colors, SHOP_DEFAULT_COLOR_SCHEME);

      expect(groups.map((group) => group.label)).toEqual(
        SHOP_COLOR_GROUPS.map((group) => group.label),
      );
      const rows = groups.flatMap((group) => group.rows);
      const accent = rows.find((row) => row.token === 'accent')!;
      expect(accent.changed).toBe(true);
      expect(accent.savedColor).toBe(SHOP_DEFAULT_COLOR_SCHEME.accent);
      expect(accent.pickerLabel).toBe(`${SHOP_SETTINGS_TEXTS.COLOR_PICKER_LABEL_PREFIX} accent`);
      expect(accent.hexLabel).toBe(`${SHOP_SETTINGS_TEXTS.COLOR_HEX_LABEL_PREFIX} accent`);
      expect(accent.usageLabel).toBe(`136 ${SHOP_SETTINGS_TEXTS.USAGE_MANY}`);
      expect(rows.find((row) => row.token === 'muted')!.changed).toBe(false);
      expect(rows.find((row) => row.token === 'background')!.changed).toBe(false);
    });
  });

  describe('buildContrastRows', () => {
    it('rates the default palette as AA everywhere', () => {
      const rows = buildContrastRows(SHOP_DEFAULT_COLOR_SCHEME);

      expect(rows).toHaveLength(SHOP_CONTRAST_PAIRS.length);
      rows.forEach((row) => {
        expect(row.verdict).toBe(SHOP_SETTINGS_TEXTS.CONTRAST_AA);
        expect(row.tone).toBe('success');
        expect(row.ratioLabel).toMatch(/^\d+\.\d:1$/);
      });
    });

    it('resolves fixed hex colors and palette tokens', () => {
      const [, , , button] = buildContrastRows(SHOP_DEFAULT_COLOR_SCHEME);

      expect(button.foreground).toBe('#ffffff');
      expect(button.background).toBe(SHOP_DEFAULT_COLOR_SCHEME.accent);
    });

    it('marks large-text-only and failing pairs', () => {
      const rows = buildContrastRows({
        ...SHOP_DEFAULT_COLOR_SCHEME,
        foreground: '#888888',
        muted: '#eeeeee',
      });

      expect(rows[0].verdict).toBe(SHOP_SETTINGS_TEXTS.CONTRAST_LARGE_TEXT);
      expect(rows[0].tone).toBe('warning');
      expect(rows[1].verdict).toBe(SHOP_SETTINGS_TEXTS.CONTRAST_FAIL);
      expect(rows[1].tone).toBe('danger');
    });
  });

  describe('buildPreviewCssVars', () => {
    it('maps every token to a kebab-case custom property', () => {
      const vars = buildPreviewCssVars(SHOP_DEFAULT_COLOR_SCHEME);

      expect(Object.keys(vars)).toHaveLength(Object.keys(SHOP_DEFAULT_COLOR_SCHEME).length);
      expect(vars['--preview-muted-light']).toBe(SHOP_DEFAULT_COLOR_SCHEME.mutedLight);
      expect(vars['--preview-accent']).toBe(SHOP_DEFAULT_COLOR_SCHEME.accent);
    });
  });
});
