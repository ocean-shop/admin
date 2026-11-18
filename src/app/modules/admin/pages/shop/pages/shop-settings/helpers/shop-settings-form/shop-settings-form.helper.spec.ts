import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import {
  SHOP_DEFAULT_COLOR_SCHEME,
  SHOP_DEFAULT_FEATURE_FLAGS,
  SHOP_SETTINGS_TEXTS,
} from '../../constants/shop-settings.constants';
import { ShopSettingsFormData } from '../../models/shop-settings-form.model';
import {
  applyShopSettingsValidators,
  buildShopSettingsPayload,
  isColorChanged,
  isDefaultColorScheme,
  isShopSettingsDirty,
  mapShopSettingsToFormData,
  resolveEffectiveColors,
  resolveShopSettingsStatus,
} from './shop-settings-form.helper';

const buildFormData = (overrides: Partial<ShopSettingsFormData> = {}): ShopSettingsFormData => ({
  features: { ...SHOP_DEFAULT_FEATURE_FLAGS },
  colors: { ...SHOP_DEFAULT_COLOR_SCHEME },
  ...overrides,
});

describe('shop settings form helper', () => {
  describe('mapShopSettingsToFormData', () => {
    it('falls back to defaults without a response', () => {
      expect(mapShopSettingsToFormData(undefined)).toEqual(buildFormData());
      expect(mapShopSettingsToFormData(null)).toEqual(buildFormData());
    });

    it('maps flags and normalizes valid colors, defaulting missing or invalid ones', () => {
      const data = mapShopSettingsToFormData({
        useUkrposhta: true,
        usePhoneLogin: null,
        useOneClickPurchase: true,
        colorScheme: { accent: '#ABCDEF', muted: 'oops', footer: null as unknown as string },
      });

      expect(data.features).toEqual({
        useUkrposhta: true,
        usePhoneLogin: false,
        useAutomaticPayment: false,
        useOneClickPurchase: true,
      });
      expect(data.colors.accent).toBe('#abcdef');
      expect(data.colors.muted).toBe(SHOP_DEFAULT_COLOR_SCHEME.muted);
      expect(data.colors.footer).toBe(SHOP_DEFAULT_COLOR_SCHEME.footer);
    });

    it('handles a null color scheme', () => {
      expect(mapShopSettingsToFormData({ colorScheme: null }).colors).toEqual(
        SHOP_DEFAULT_COLOR_SCHEME,
      );
    });
  });

  describe('resolveEffectiveColors', () => {
    it('normalizes valid colors and falls back for invalid ones', () => {
      const fallback = { ...SHOP_DEFAULT_COLOR_SCHEME, muted: '#111111' };
      const colors = { ...SHOP_DEFAULT_COLOR_SCHEME, accent: 'ABCDEF', muted: '#12' };

      const effective = resolveEffectiveColors(colors, fallback);

      expect(effective.accent).toBe('#abcdef');
      expect(effective.muted).toBe('#111111');
    });
  });

  describe('isColorChanged', () => {
    it('is true only for a valid color different from the saved one', () => {
      expect(isColorChanged('#123456', '#00685f')).toBe(true);
      expect(isColorChanged('00685F', '#00685f')).toBe(false);
      expect(isColorChanged('#12', '#00685f')).toBe(false);
    });
  });

  describe('isShopSettingsDirty', () => {
    const saved = buildFormData();

    it('is false for identical data, including differently cased colors', () => {
      const current = buildFormData({
        colors: { ...SHOP_DEFAULT_COLOR_SCHEME, accent: '00685F' },
      });
      expect(isShopSettingsDirty(current, saved)).toBe(false);
    });

    it('is true when a feature flag changes', () => {
      const current = buildFormData({
        features: { ...SHOP_DEFAULT_FEATURE_FLAGS, usePhoneLogin: true },
      });
      expect(isShopSettingsDirty(current, saved)).toBe(true);
    });

    it('is true when a color changes or becomes invalid', () => {
      expect(
        isShopSettingsDirty(
          buildFormData({ colors: { ...SHOP_DEFAULT_COLOR_SCHEME, accent: '#000000' } }),
          saved,
        ),
      ).toBe(true);
      expect(
        isShopSettingsDirty(
          buildFormData({ colors: { ...SHOP_DEFAULT_COLOR_SCHEME, accent: '#00' } }),
          saved,
        ),
      ).toBe(true);
    });
  });

  describe('isDefaultColorScheme', () => {
    it('detects the default palette', () => {
      expect(isDefaultColorScheme(SHOP_DEFAULT_COLOR_SCHEME)).toBe(true);
      expect(isDefaultColorScheme({ ...SHOP_DEFAULT_COLOR_SCHEME, accent: '00685F' })).toBe(true);
    });

    it('is false for a changed or invalid color', () => {
      expect(isDefaultColorScheme({ ...SHOP_DEFAULT_COLOR_SCHEME, accent: '#000000' })).toBe(false);
      expect(isDefaultColorScheme({ ...SHOP_DEFAULT_COLOR_SCHEME, accent: 'bad' })).toBe(false);
    });
  });

  describe('buildShopSettingsPayload', () => {
    it('is empty when nothing changed', () => {
      expect(buildShopSettingsPayload(buildFormData(), buildFormData())).toEqual({});
    });

    it('sends changed flags and colors, resetting default colors with null', () => {
      const saved = buildFormData({
        colors: { ...SHOP_DEFAULT_COLOR_SCHEME, accent: '#123456' },
      });
      const current = buildFormData({
        features: { ...SHOP_DEFAULT_FEATURE_FLAGS, useAutomaticPayment: true },
        colors: {
          ...SHOP_DEFAULT_COLOR_SCHEME,
          accent: SHOP_DEFAULT_COLOR_SCHEME.accent,
          muted: 'ABCDEF',
          footer: 'bad',
        },
      });

      expect(buildShopSettingsPayload(current, saved)).toEqual({
        useAutomaticPayment: true,
        colorScheme: { accent: null, muted: '#abcdef' },
      });
    });
  });

  describe('resolveShopSettingsStatus', () => {
    it('prioritizes invalid over dirty over clean', () => {
      expect(resolveShopSettingsStatus(true, true)).toBe('invalid');
      expect(resolveShopSettingsStatus(false, true)).toBe('dirty');
      expect(resolveShopSettingsStatus(false, false)).toBe('clean');
    });
  });

  describe('applyShopSettingsValidators', () => {
    it('validates every color as a hex value', () => {
      const model = signal(buildFormData());
      const settingsForm = TestBed.runInInjectionContext(() =>
        form(model, applyShopSettingsValidators),
      );

      expect(settingsForm().valid()).toBe(true);

      model.update((data) => ({ ...data, colors: { ...data.colors, footer: '#12' } }));

      expect(settingsForm.colors.footer().invalid()).toBe(true);
      expect(settingsForm.colors.footer().errors()[0]?.message).toBe(
        SHOP_SETTINGS_TEXTS.COLOR_HEX_INVALID,
      );
      expect(settingsForm.colors.accent().valid()).toBe(true);
    });
  });
});
