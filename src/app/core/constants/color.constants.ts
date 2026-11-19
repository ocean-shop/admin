/** `#rrggbb` or `rrggbb` as typed by a user; `#` is optional. */
export const HEX_COLOR_INPUT_PATTERN = /^#?[0-9a-fA-F]{6}$/;
export const HEX_COLOR_PREFIX = '#';
export const HEX_COLOR_RADIX = 16;
/** Start index of the R, G and B pairs in a 6-digit hex string. */
export const HEX_COLOR_CHANNEL_OFFSETS = [0, 2, 4] as const;
export const HEX_COLOR_CHANNEL_LENGTH = 2;
export const COLOR_CHANNEL_MAX = 255;

/** sRGB → linear conversion constants (WCAG 2.x relative luminance). */
export const SRGB_LINEAR_THRESHOLD = 0.03928;
export const SRGB_LINEAR_DIVISOR = 12.92;
export const SRGB_GAMMA_OFFSET = 0.055;
export const SRGB_GAMMA_DIVISOR = 1.055;
export const SRGB_GAMMA_EXPONENT = 2.4;
export const LUMINANCE_WEIGHTS = [0.2126, 0.7152, 0.0722] as const;
export const CONTRAST_LUMINANCE_OFFSET = 0.05;

/** WCAG AA: 4.5:1 for normal text, 3:1 for large text. */
export const WCAG_AA_NORMAL_TEXT_RATIO = 4.5;
export const WCAG_AA_LARGE_TEXT_RATIO = 3;
