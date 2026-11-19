import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FieldTree, form, pattern } from '@angular/forms/signals';
import { ColorField } from './color-field';
import { COLOR_FIELD_DEFAULT_COLOR } from './constants/color-field.constants';

type ColorModel = { color: string };

describe('ColorField', () => {
  let fixture: ComponentFixture<ColorField>;
  let element: HTMLElement;
  let model: ReturnType<typeof signal<ColorModel>>;
  let colorForm: FieldTree<ColorModel>;

  const swatch = (): HTMLInputElement =>
    element.querySelector('.color-field-swatch') as HTMLInputElement;
  const hexInput = (): HTMLInputElement =>
    element.querySelector('.color-field-input') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorField],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    model = signal<ColorModel>({ color: '#00685F' });
    colorForm = TestBed.runInInjectionContext(() =>
      form(model, (path) => {
        pattern(path.color, /^#?[0-9a-fA-F]{6}$/, { message: 'Формат #rrggbb' });
      }),
    );

    fixture = TestBed.createComponent(ColorField);
    fixture.componentRef.setInput('id', 'accent');
    fixture.componentRef.setInput('control', colorForm.color);
    fixture.componentRef.setInput('pickerLabel', 'Вибрати колір accent');
    fixture.componentRef.setInput('hexLabel', 'HEX-код кольору accent');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the normalized color in the swatch and the raw value in the hex input', () => {
    expect(swatch().value).toBe('#00685f');
    expect(swatch().getAttribute('aria-label')).toBe('Вибрати колір accent');
    expect(hexInput().value).toBe('#00685F');
    expect(hexInput().id).toBe('accent');
    expect(hexInput().getAttribute('aria-label')).toBe('HEX-код кольору accent');
    expect(hexInput().hasAttribute('aria-invalid')).toBe(false);
    expect(element.querySelector('.color-field-error')).toBeNull();
  });

  it('writes the picked color into the field', async () => {
    swatch().value = '#123456';
    swatch().dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(model().color).toBe('#123456');
    expect(colorForm.color().dirty()).toBe(true);
    expect(hexInput().value).toBe('#123456');
  });

  it('shows the validation error and the default fallback swatch for an invalid hex', async () => {
    model.set({ color: '#12' });
    await fixture.whenStable();

    expect(swatch().value).toBe(COLOR_FIELD_DEFAULT_COLOR);
    expect(element.querySelector('.color-field')?.classList).toContain('color-field-invalid');
    expect(element.querySelector('.color-field-error')?.textContent).toContain('Формат #rrggbb');
    expect(hexInput().getAttribute('aria-invalid')).toBe('true');
    expect(hexInput().getAttribute('aria-describedby')).toBe('accent-error');
  });

  it('uses the given fallback color while the hex is invalid', async () => {
    fixture.componentRef.setInput('fallbackColor', '#abcdef');
    model.set({ color: 'zzz' });
    await fixture.whenStable();

    expect(swatch().value).toBe('#abcdef');
  });

  it('shows no message for an invalid field without error messages', async () => {
    const plainModel = signal<ColorModel>({ color: 'bad' });
    const plainForm = TestBed.runInInjectionContext(() =>
      form(plainModel, (path) => {
        pattern(path.color, /^#[0-9a-f]{6}$/);
      }),
    );
    fixture.componentRef.setInput('control', plainForm.color);
    await fixture.whenStable();

    expect(element.querySelector('.color-field-error')).toBeNull();
  });
});
