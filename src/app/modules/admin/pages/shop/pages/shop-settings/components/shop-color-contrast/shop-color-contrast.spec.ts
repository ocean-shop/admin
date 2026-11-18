import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  SHOP_CONTRAST_PAIRS,
  SHOP_DEFAULT_COLOR_SCHEME,
  SHOP_SETTINGS_TEXTS,
} from '../../constants/shop-settings.constants';
import { ShopColorContrast } from './shop-color-contrast';

describe('ShopColorContrast', () => {
  let fixture: ComponentFixture<ShopColorContrast>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopColorContrast],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ShopColorContrast);
    fixture.componentRef.setInput('palette', SHOP_DEFAULT_COLOR_SCHEME);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders one row per contrast pair with the note', () => {
    const rows = element.querySelectorAll('.contrast-row');

    expect(rows).toHaveLength(SHOP_CONTRAST_PAIRS.length);
    expect(rows[0].textContent).toContain(SHOP_CONTRAST_PAIRS[0].label);
    expect(rows[0].textContent).toContain(SHOP_SETTINGS_TEXTS.CONTRAST_AA);
    expect(element.textContent).toContain(SHOP_SETTINGS_TEXTS.CONTRAST_NOTE);
  });

  it('paints the sample with the pair colors and re-rates on palette change', async () => {
    fixture.componentRef.setInput('palette', {
      ...SHOP_DEFAULT_COLOR_SCHEME,
      foreground: '#eeeeee',
    });
    await fixture.whenStable();

    const sample = element.querySelector('.contrast-sample') as HTMLElement;
    expect(sample.style.color).toBe('rgb(238, 238, 238)');
    expect(sample.style.backgroundColor).toBe('rgb(255, 255, 255)');
    expect(element.querySelector('.contrast-row')?.textContent).toContain(
      SHOP_SETTINGS_TEXTS.CONTRAST_FAIL,
    );
  });
});
