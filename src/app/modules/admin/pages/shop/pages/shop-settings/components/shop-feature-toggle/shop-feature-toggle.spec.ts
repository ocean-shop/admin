import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { SHOP_FEATURE_OPTIONS, SHOP_SETTINGS_TEXTS } from '../../constants/shop-settings.constants';
import { ShopFeatureToggle } from './shop-feature-toggle';

describe('ShopFeatureToggle', () => {
  let fixture: ComponentFixture<ShopFeatureToggle>;
  let element: HTMLElement;
  let model: ReturnType<typeof signal<{ enabled: boolean }>>;
  const option = SHOP_FEATURE_OPTIONS[0];

  const input = (): HTMLInputElement => element.querySelector('input') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopFeatureToggle],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    model = signal({ enabled: false });
    const toggleForm = TestBed.runInInjectionContext(() => form(model));

    fixture = TestBed.createComponent(ShopFeatureToggle);
    fixture.componentRef.setInput('option', option);
    fixture.componentRef.setInput('control', toggleForm.enabled);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the feature info and the off state', () => {
    expect(element.querySelector('.shop-feature-icon')?.textContent).toContain(option.icon);
    expect(element.querySelector('.shop-feature-title')?.textContent).toContain(option.title);
    expect(element.querySelector('.shop-feature-code')?.textContent).toContain(option.code);
    expect(element.querySelector('.shop-feature-description')?.textContent).toContain(
      option.description,
    );
    expect(element.querySelector('.admin-switch-label')?.textContent).toContain(
      SHOP_SETTINGS_TEXTS.FEATURE_OFF,
    );
    expect(input().checked).toBe(false);
    expect(input().id).toBe(`shop-feature-${option.key}`);
    expect(input().getAttribute('aria-label')).toBe(option.title);
    expect(element.querySelector('.shop-feature-switch-on')).toBeNull();
  });

  it('updates the field and the state label when toggled', async () => {
    input().click();
    await fixture.whenStable();

    expect(model().enabled).toBe(true);
    expect(element.querySelector('.admin-switch-label')?.textContent).toContain(
      SHOP_SETTINGS_TEXTS.FEATURE_ON,
    );
    expect(element.querySelector('.shop-feature-switch-on')).not.toBeNull();
  });
});
