import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import {
  SHOP_DEFAULT_COLOR_SCHEME,
  SHOP_SETTINGS_STATUS_VIEWS,
  SHOP_SETTINGS_TEXTS,
} from './constants/shop-settings.constants';
import { ShopSettingsApiResponse } from './models/shop-settings-api.model';
import { ShopSettingsService } from './services/shop-settings/shop-settings.service';
import { ShopSettings } from './shop-settings';

const buildResponse = (
  overrides: Partial<ShopSettingsApiResponse> = {},
): ShopSettingsApiResponse => ({
  shopId: 'shop-1',
  useUkrposhta: true,
  usePhoneLogin: false,
  useAutomaticPayment: false,
  useOneClickPurchase: true,
  colorScheme: { ...SHOP_DEFAULT_COLOR_SCHEME, accent: '#123456' },
  updatedAt: '2026-11-18T07:00:00.000Z',
  ...overrides,
});

describe('ShopSettings', () => {
  let fixture: ComponentFixture<ShopSettings>;
  let component: any;
  let element: HTMLElement;
  let mockService: {
    getShopSettings: ReturnType<typeof vi.fn>;
    updateShopSettings: ReturnType<typeof vi.fn>;
  };
  let mockToaster: { success: ReturnType<typeof vi.fn> };

  const setup = async (shopId: string | null = 'shop-1') => {
    const params = shopId ? { shopId } : {};

    await TestBed.configureTestingModule({
      imports: [ShopSettings],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        ...provideTestQueryClient(),
        { provide: ShopSettingsService, useValue: mockService },
        { provide: ToasterService, useValue: mockToaster },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(params) },
            paramMap: new BehaviorSubject(convertToParamMap(params)).asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopSettings);
    component = fixture.componentInstance;
    element = fixture.nativeElement as HTMLElement;
    await flushQueries(fixture);
  };

  const buttonByText = (text: string): HTMLButtonElement =>
    Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes(text),
    ) as HTMLButtonElement;

  const setColor = async (token: string, value: string): Promise<void> => {
    component.formModel.update((data: any) => ({
      ...data,
      colors: { ...data.colors, [token]: value },
    }));
    await fixture.whenStable();
  };

  beforeEach(() => {
    mockService = {
      getShopSettings: vi.fn(() => of(buildResponse())),
      updateShopSettings: vi.fn(),
    };
    mockToaster = { success: vi.fn() };
  });

  it('warns and skips loading without a shop id', async () => {
    await setup(null);

    expect(element.textContent).toContain(SHOP_SETTINGS_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
    expect(mockService.getShopSettings).not.toHaveBeenCalled();
    expect(component.isLoading()).toBe(false);
    expect(element.querySelector('app-action-bar')).toBeNull();
  });

  it('shows the error message when loading fails', async () => {
    mockService.getShopSettings.mockReturnValue(throwError(() => new Error('fail')));
    await setup();

    expect(element.textContent).toContain(SHOP_SETTINGS_TEXTS.LOAD_ERROR_MESSAGE);
    expect(element.querySelector('app-action-bar')).toBeNull();
  });

  it('loads the settings into the form in a clean state', async () => {
    await setup();

    expect(mockService.getShopSettings).toHaveBeenCalledWith('shop-1');
    expect(element.querySelectorAll('app-shop-feature-toggle')).toHaveLength(4);
    expect(element.querySelectorAll('app-shop-color-row')).toHaveLength(18);
    expect(component.formModel().features.useUkrposhta).toBe(true);
    expect(component.formModel().colors.accent).toBe('#123456');
    expect(component.status()).toEqual(SHOP_SETTINGS_STATUS_VIEWS.clean);
    expect(buttonByText(SHOP_SETTINGS_TEXTS.SAVE_LABEL).disabled).toBe(true);
    expect(buttonByText(SHOP_SETTINGS_TEXTS.DISCARD_LABEL).disabled).toBe(true);
    expect(buttonByText(SHOP_SETTINGS_TEXTS.COLORS_RESET_LABEL).disabled).toBe(false);
  });

  it('marks the form dirty on a feature toggle and discards the change', async () => {
    await setup();

    (element.querySelector('#shop-feature-usePhoneLogin') as HTMLInputElement).click();
    await fixture.whenStable();

    expect(component.formModel().features.usePhoneLogin).toBe(true);
    expect(component.status()).toEqual(SHOP_SETTINGS_STATUS_VIEWS.dirty);
    expect(buttonByText(SHOP_SETTINGS_TEXTS.SAVE_LABEL).disabled).toBe(false);

    buttonByText(SHOP_SETTINGS_TEXTS.DISCARD_LABEL).click();
    await fixture.whenStable();

    expect(component.formModel().features.usePhoneLogin).toBe(false);
    expect(component.status()).toEqual(SHOP_SETTINGS_STATUS_VIEWS.clean);
  });

  it('blocks saving while a color is invalid and keeps the saved color in the preview', async () => {
    await setup();
    await setColor('accent', '#12');

    expect(component.status()).toEqual(SHOP_SETTINGS_STATUS_VIEWS.invalid);
    expect(component.canSave()).toBe(false);
    expect(component.effectiveColors().accent).toBe('#123456');
    expect(element.textContent).toContain(SHOP_SETTINGS_TEXTS.COLOR_HEX_INVALID);

    component.onSave();
    expect(mockService.updateShopSettings).not.toHaveBeenCalled();
  });

  it('resets the colors to the defaults', async () => {
    await setup();

    buttonByText(SHOP_SETTINGS_TEXTS.COLORS_RESET_LABEL).click();
    await fixture.whenStable();

    expect(component.formModel().colors).toEqual(SHOP_DEFAULT_COLOR_SCHEME);
    expect(component.isColorSchemeDefault()).toBe(true);
    expect(buttonByText(SHOP_SETTINGS_TEXTS.COLORS_RESET_LABEL).disabled).toBe(true);
    expect(component.isDirty()).toBe(true);
  });

  it('saves only the changes, updates the cache and shows a toast', async () => {
    const saved = buildResponse({
      usePhoneLogin: true,
      colorScheme: { ...SHOP_DEFAULT_COLOR_SCHEME, muted: '#abcdef' },
    });
    mockService.updateShopSettings.mockReturnValue(of(saved));
    await setup();

    component.formModel.update((data: any) => ({
      ...data,
      features: { ...data.features, usePhoneLogin: true },
      colors: { ...data.colors, accent: SHOP_DEFAULT_COLOR_SCHEME.accent, muted: 'ABCDEF' },
    }));
    await fixture.whenStable();
    mockService.getShopSettings.mockReturnValue(of(saved));

    buttonByText(SHOP_SETTINGS_TEXTS.SAVE_LABEL).click();
    await flushQueries(fixture);

    expect(mockService.updateShopSettings).toHaveBeenCalledWith('shop-1', {
      usePhoneLogin: true,
      colorScheme: { accent: null, muted: '#abcdef' },
    });
    expect(mockToaster.success).toHaveBeenCalledWith(SHOP_SETTINGS_TEXTS.SAVE_SUCCESS_TITLE);
    expect(component.formModel().colors.muted).toBe('#abcdef');
    expect(component.formModel().colors.accent).toBe(SHOP_DEFAULT_COLOR_SCHEME.accent);
    expect(component.status()).toEqual(SHOP_SETTINGS_STATUS_VIEWS.clean);
  });

  it('ignores save when nothing changed', async () => {
    await setup();

    component.onSave();

    expect(mockService.updateShopSettings).not.toHaveBeenCalled();
  });
});
