import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { form } from '@angular/forms/signals';
import { Switch } from './switch';

describe('Switch', () => {
  let fixture: ComponentFixture<Switch>;
  let element: HTMLElement;

  const input = (): HTMLInputElement => element.querySelector('input') as HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Switch],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Switch);
    fixture.componentRef.setInput('label', 'Доступна');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders a switch role checkbox with a generated id and label', () => {
    expect(input().getAttribute('role')).toBe('switch');
    expect(input().id).toMatch(/^admin-switch-\d+$/);
    expect(element.querySelector('label')?.getAttribute('for')).toBe(input().id);
    expect(element.textContent).toContain('Доступна');
    expect(element.querySelector('.admin-switch-description')).toBeNull();
  });

  it('uses the explicit id, description, checked and disabled inputs', async () => {
    fixture.componentRef.setInput('id', 'available');
    fixture.componentRef.setInput('description', 'Показувати покупцям');
    fixture.componentRef.setInput('checked', true);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect(input().id).toBe('available');
    expect(input().checked).toBe(true);
    expect(input().disabled).toBe(true);
    expect(element.querySelector('.admin-switch')?.classList).toContain('admin-switch-disabled');
    expect(element.querySelector('.admin-switch-description')?.textContent).toContain(
      'Показувати покупцям',
    );
  });

  it('emits checkedChange on toggle', () => {
    const emitSpy = vi.spyOn(fixture.componentInstance.checkedChange, 'emit');

    input().click();

    expect(emitSpy).toHaveBeenCalledWith(true);
  });

  it('binds to a signal form field when a control is given', async () => {
    const model = TestBed.runInInjectionContext(() => form(signal({ enabled: true })));
    fixture.componentRef.setInput('control', model.enabled);
    await fixture.whenStable();

    expect(input().checked).toBe(true);
  });
});
