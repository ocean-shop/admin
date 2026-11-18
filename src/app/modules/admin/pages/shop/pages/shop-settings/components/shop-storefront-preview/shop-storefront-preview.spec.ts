import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SHOP_DEFAULT_COLOR_SCHEME,
  SHOP_SETTINGS_TEXTS,
} from '../../constants/shop-settings.constants';
import { SHOP_STOREFRONT_PREVIEW_TEXTS } from '../../constants/shop-storefront-preview.constants';
import { ShopStorefrontPreview } from './shop-storefront-preview';

describe('ShopStorefrontPreview', () => {
  let fixture: ComponentFixture<ShopStorefrontPreview>;
  let element: HTMLElement;

  const preview = (): HTMLElement => element.querySelector('.preview') as HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopStorefrontPreview],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopStorefrontPreview);
    fixture.componentRef.setInput('palette', SHOP_DEFAULT_COLOR_SCHEME);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the sample storefront hidden from assistive tech', () => {
    expect(element.textContent).toContain(SHOP_SETTINGS_TEXTS.PREVIEW_TITLE);
    expect(element.textContent).toContain(SHOP_STOREFRONT_PREVIEW_TEXTS.PRODUCT_NAME);
    expect(preview().getAttribute('aria-hidden')).toBe('true');
  });

  it('exposes the palette as custom properties and follows changes', async () => {
    expect(preview().style.getPropertyValue('--preview-accent')).toBe(
      SHOP_DEFAULT_COLOR_SCHEME.accent,
    );

    fixture.componentRef.setInput('palette', { ...SHOP_DEFAULT_COLOR_SCHEME, accent: '#123456' });
    await fixture.whenStable();

    expect(preview().style.getPropertyValue('--preview-accent')).toBe('#123456');
    expect(preview().style.getPropertyValue('--preview-muted-light')).toBe(
      SHOP_DEFAULT_COLOR_SCHEME.mutedLight,
    );
  });
});
