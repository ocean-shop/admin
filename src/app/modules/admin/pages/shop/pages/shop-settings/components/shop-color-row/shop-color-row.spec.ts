import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { SHOP_SETTINGS_TEXTS } from '../../constants/shop-settings.constants';
import { ShopColorRowView } from '../../models/shop-color-row-view.model';
import { ShopColorRow } from './shop-color-row';

const row: ShopColorRowView = {
  token: 'mutedLight',
  name: 'muted-light',
  usageCount: 82,
  usageLabel: '82 використання',
  description: 'Третинний текст',
  pickerLabel: 'Вибрати колір muted-light',
  hexLabel: 'HEX-код кольору muted-light',
  savedColor: '#5f6c69',
  changed: false,
};

describe('ShopColorRow', () => {
  let fixture: ComponentFixture<ShopColorRow>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShopColorRow],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    const colorForm = TestBed.runInInjectionContext(() => form(signal({ color: '#5f6c69' })));

    fixture = TestBed.createComponent(ShopColorRow);
    fixture.componentRef.setInput('row', row);
    fixture.componentRef.setInput('control', colorForm.color);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the token info and the color field without the changed badge', () => {
    expect(element.querySelector('.shop-color-name')?.textContent).toContain('muted-light');
    expect(element.querySelector('.shop-color-usage')?.textContent).toContain(row.usageLabel);
    expect(element.querySelector('.shop-color-description')?.textContent).toContain(
      row.description,
    );
    expect(element.querySelector('app-badge')).toBeNull();
    const hexInput = element.querySelector('.color-field-input') as HTMLInputElement;
    expect(hexInput.id).toBe('shop-color-muted-light');
    expect(hexInput.getAttribute('aria-label')).toBe(row.hexLabel);
  });

  it('shows the changed badge', async () => {
    fixture.componentRef.setInput('row', { ...row, changed: true });
    await fixture.whenStable();

    expect(element.querySelector('app-badge')?.textContent).toContain(
      SHOP_SETTINGS_TEXTS.COLOR_CHANGED_BADGE,
    );
  });
});
