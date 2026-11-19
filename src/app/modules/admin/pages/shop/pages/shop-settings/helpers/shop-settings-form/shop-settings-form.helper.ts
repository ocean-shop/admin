import { maxLength, pattern, SchemaPathTree } from '@angular/forms/signals';
import { HEX_COLOR_INPUT_PATTERN } from '@core/constants/color.constants';
import { isHexColor, normalizeHexColor } from '@core/helpers/color/color.helper';
import { COLOR_FIELD_HEX_MAX_LENGTH } from '@ui/color-field/constants/color-field.constants';
import {
  SHOP_COLOR_TOKENS,
  SHOP_DEFAULT_COLOR_SCHEME,
  SHOP_FEATURE_OPTIONS,
  SHOP_SETTINGS_TEXTS,
} from '../../constants/shop-settings.constants';
import { ShopColorScheme, ShopColorSchemePatch } from '../../models/shop-color-scheme.model';
import { ShopFeatureFlags } from '../../models/shop-feature-flags.model';
import {
  ShopSettingsApiResponse,
  ShopSettingsUpdatePayload,
} from '../../models/shop-settings-api.model';
import { ShopSettingsFormData } from '../../models/shop-settings-form.model';
import { ShopSettingsStatus } from '../../models/shop-settings-status.type';

/** Every color field must be a 6-digit hex (`#` optional while typing). */
export const applyShopSettingsValidators = (
  schemaPath: SchemaPathTree<ShopSettingsFormData>,
): void => {
  const options = { message: SHOP_SETTINGS_TEXTS.COLOR_HEX_INVALID };

  SHOP_COLOR_TOKENS.forEach((token) => {
    maxLength(schemaPath.colors[token], COLOR_FIELD_HEX_MAX_LENGTH, options);
    pattern(schemaPath.colors[token], HEX_COLOR_INPUT_PATTERN, options);
  });
};

/** API → form model; missing or malformed values fall back to the defaults. */
export const mapShopSettingsToFormData = (
  response: ShopSettingsApiResponse | null | undefined,
): ShopSettingsFormData => {
  const features = SHOP_FEATURE_OPTIONS.reduce(
    (flags, { key }) => ({ ...flags, [key]: response?.[key] === true }),
    {} as ShopFeatureFlags,
  );
  const colors = SHOP_COLOR_TOKENS.reduce((scheme, token) => {
    const color = response?.colorScheme?.[token];
    return {
      ...scheme,
      [token]:
        color && isHexColor(color) ? normalizeHexColor(color) : SHOP_DEFAULT_COLOR_SCHEME[token],
    };
  }, {} as ShopColorScheme);

  return { features, colors };
};

/** Typed colors with invalid entries replaced by `fallback` (the saved palette). */
export const resolveEffectiveColors = (
  colors: ShopColorScheme,
  fallback: ShopColorScheme,
): ShopColorScheme =>
  SHOP_COLOR_TOKENS.reduce(
    (scheme, token) => ({
      ...scheme,
      [token]: isHexColor(colors[token]) ? normalizeHexColor(colors[token]) : fallback[token],
    }),
    {} as ShopColorScheme,
  );

/** A valid typed color that differs from the saved one. */
export const isColorChanged = (value: string, saved: string): boolean =>
  isHexColor(value) && normalizeHexColor(value) !== saved;

const isColorDirty = (value: string, saved: string): boolean =>
  !isHexColor(value) || normalizeHexColor(value) !== saved;

export const isShopSettingsDirty = (
  current: ShopSettingsFormData,
  saved: ShopSettingsFormData,
): boolean =>
  SHOP_FEATURE_OPTIONS.some(({ key }) => current.features[key] !== saved.features[key]) ||
  SHOP_COLOR_TOKENS.some((token) => isColorDirty(current.colors[token], saved.colors[token]));

export const isDefaultColorScheme = (colors: ShopColorScheme): boolean =>
  SHOP_COLOR_TOKENS.every(
    (token) =>
      isHexColor(colors[token]) &&
      normalizeHexColor(colors[token]) === SHOP_DEFAULT_COLOR_SCHEME[token],
  );

/**
 * Only the changed fields. A color equal to the default is sent as `null`,
 * so the shop drops its override and follows future default changes.
 */
export const buildShopSettingsPayload = (
  current: ShopSettingsFormData,
  saved: ShopSettingsFormData,
): ShopSettingsUpdatePayload => {
  const payload: ShopSettingsUpdatePayload = {};

  SHOP_FEATURE_OPTIONS.forEach(({ key }) => {
    if (current.features[key] !== saved.features[key]) {
      payload[key] = current.features[key];
    }
  });

  const colorScheme = SHOP_COLOR_TOKENS.reduce<ShopColorSchemePatch>((patch, token) => {
    const value = current.colors[token];
    if (!isColorChanged(value, saved.colors[token])) {
      return patch;
    }

    const color = normalizeHexColor(value);
    return { ...patch, [token]: color === SHOP_DEFAULT_COLOR_SCHEME[token] ? null : color };
  }, {});

  if (Object.keys(colorScheme).length > 0) {
    payload.colorScheme = colorScheme;
  }

  return payload;
};

export const resolveShopSettingsStatus = (
  isInvalid: boolean,
  isDirty: boolean,
): ShopSettingsStatus => {
  if (isInvalid) {
    return 'invalid';
  }

  return isDirty ? 'dirty' : 'clean';
};
