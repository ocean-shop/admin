import {
  COLOR_CHANNEL_MAX,
  CONTRAST_LUMINANCE_OFFSET,
  HEX_COLOR_CHANNEL_LENGTH,
  HEX_COLOR_CHANNEL_OFFSETS,
  HEX_COLOR_INPUT_PATTERN,
  HEX_COLOR_PREFIX,
  HEX_COLOR_RADIX,
  LUMINANCE_WEIGHTS,
  SRGB_GAMMA_DIVISOR,
  SRGB_GAMMA_EXPONENT,
  SRGB_GAMMA_OFFSET,
  SRGB_LINEAR_DIVISOR,
  SRGB_LINEAR_THRESHOLD,
} from '@core/constants/color.constants';

/** True for a 6-digit hex color, with or without the leading `#`. */
export const isHexColor = (value: string | null | undefined): boolean =>
  HEX_COLOR_INPUT_PATTERN.test((value ?? '').trim());

/** `' 00685F '` → `'#00685f'`. Expects a value that passed `isHexColor`. */
export const normalizeHexColor = (value: string): string => {
  const color = value.trim().toLowerCase();

  return color.startsWith(HEX_COLOR_PREFIX) ? color : `${HEX_COLOR_PREFIX}${color}`;
};

const toLinearChannel = (channel: number): number =>
  channel <= SRGB_LINEAR_THRESHOLD
    ? channel / SRGB_LINEAR_DIVISOR
    : Math.pow((channel + SRGB_GAMMA_OFFSET) / SRGB_GAMMA_DIVISOR, SRGB_GAMMA_EXPONENT);

/** WCAG relative luminance of a valid hex color (0 = black, 1 = white). */
export const getRelativeLuminance = (hex: string): number => {
  const digits = normalizeHexColor(hex).slice(HEX_COLOR_PREFIX.length);

  return HEX_COLOR_CHANNEL_OFFSETS.reduce<number>((luminance, offset, index) => {
    const channel =
      parseInt(digits.slice(offset, offset + HEX_COLOR_CHANNEL_LENGTH), HEX_COLOR_RADIX) /
      COLOR_CHANNEL_MAX;

    return luminance + LUMINANCE_WEIGHTS[index] * toLinearChannel(channel);
  }, 0);
};

/** WCAG contrast ratio between two valid hex colors, from 1 to 21. */
export const getContrastRatio = (first: string, second: string): number => {
  const firstLuminance = getRelativeLuminance(first);
  const secondLuminance = getRelativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);

  return (lighter + CONTRAST_LUMINANCE_OFFSET) / (darker + CONTRAST_LUMINANCE_OFFSET);
};
