import {
  HEX_COLOR_PREFIX,
  WCAG_AA_LARGE_TEXT_RATIO,
  WCAG_AA_NORMAL_TEXT_RATIO,
} from '@core/constants/color.constants';
import { getContrastRatio } from '@core/helpers/color/color.helper';
import {
  SHOP_COLOR_GROUPS,
  SHOP_CONTRAST_PAIRS,
  SHOP_CONTRAST_RATIO_FRACTION_DIGITS,
  SHOP_CONTRAST_RATIO_SUFFIX,
  SHOP_PREVIEW_CSS_VAR_PREFIX,
  SHOP_SETTINGS_TEXTS,
  SHOP_USAGE_PLURAL_RULE,
} from '../../constants/shop-settings.constants';
import { ShopColorGroupView } from '../../models/shop-color-group-view.model';
import { ShopColorScheme } from '../../models/shop-color-scheme.model';
import { ShopColorToken } from '../../models/shop-color-token.type';
import { ShopContrastColor } from '../../models/shop-contrast-color.type';
import { ShopContrastRow } from '../../models/shop-contrast-row.model';
import { isColorChanged } from '../shop-settings-form/shop-settings-form.helper';

/** `82` → `82 використання`, `5` → `5 використань`, `12` → `12 використань`. */
export const formatColorUsageLabel = (count: number): string => {
  const { BASE, TEENS_BASE, FEW_MIN, FEW_MAX, TEENS_MIN, TEENS_MAX } = SHOP_USAGE_PLURAL_RULE;
  const lastDigit = count % BASE;
  const lastTwoDigits = count % TEENS_BASE;
  const isFew =
    lastDigit >= FEW_MIN &&
    lastDigit <= FEW_MAX &&
    !(lastTwoDigits >= TEENS_MIN && lastTwoDigits <= TEENS_MAX);

  return `${count} ${isFew ? SHOP_SETTINGS_TEXTS.USAGE_FEW : SHOP_SETTINGS_TEXTS.USAGE_MANY}`;
};

export const buildColorGroupViews = (
  colors: ShopColorScheme,
  saved: ShopColorScheme,
): ShopColorGroupView[] =>
  SHOP_COLOR_GROUPS.map((group) => ({
    label: group.label,
    rows: group.options.map((option) => ({
      ...option,
      usageLabel: formatColorUsageLabel(option.usageCount),
      pickerLabel: `${SHOP_SETTINGS_TEXTS.COLOR_PICKER_LABEL_PREFIX} ${option.name}`,
      hexLabel: `${SHOP_SETTINGS_TEXTS.COLOR_HEX_LABEL_PREFIX} ${option.name}`,
      savedColor: saved[option.token],
      changed: isColorChanged(colors[option.token], saved[option.token]),
    })),
  }));

const resolveContrastColor = (color: ShopContrastColor, palette: ShopColorScheme): string =>
  color.startsWith(HEX_COLOR_PREFIX) ? color : palette[color as ShopColorToken];

export const buildContrastRows = (palette: ShopColorScheme): ShopContrastRow[] =>
  SHOP_CONTRAST_PAIRS.map((pair) => {
    const foreground = resolveContrastColor(pair.foreground, palette);
    const background = resolveContrastColor(pair.background, palette);
    const ratio = getContrastRatio(foreground, background);
    const passesNormal = ratio >= WCAG_AA_NORMAL_TEXT_RATIO;
    const passesLarge = ratio >= WCAG_AA_LARGE_TEXT_RATIO;

    return {
      label: pair.label,
      foreground,
      background,
      ratioLabel: `${ratio.toFixed(SHOP_CONTRAST_RATIO_FRACTION_DIGITS)}${SHOP_CONTRAST_RATIO_SUFFIX}`,
      verdict: passesNormal
        ? SHOP_SETTINGS_TEXTS.CONTRAST_AA
        : passesLarge
          ? SHOP_SETTINGS_TEXTS.CONTRAST_LARGE_TEXT
          : SHOP_SETTINGS_TEXTS.CONTRAST_FAIL,
      tone: passesNormal ? 'success' : passesLarge ? 'warning' : 'danger',
    };
  });

/** Palette as CSS custom properties named after the storefront tokens (`--preview-muted-light`). */
export const buildPreviewCssVars = (palette: ShopColorScheme): Record<string, string> =>
  SHOP_COLOR_GROUPS.flatMap((group) => group.options).reduce<Record<string, string>>(
    (vars, option) => ({
      ...vars,
      [`${SHOP_PREVIEW_CSS_VAR_PREFIX}${option.name}`]: palette[option.token],
    }),
    {},
  );
