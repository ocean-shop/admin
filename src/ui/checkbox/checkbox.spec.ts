import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  let fixture: ComponentFixture<Checkbox>;
  let component: Checkbox;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Checkbox],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Checkbox);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Accept terms');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render checkbox with label and generated id by default', () => {
    const label = fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

    expect(label.textContent).toContain('Accept terms');
    expect(input.type).toBe('checkbox');
    expect(input.id).toContain('admin-checkbox-');
    expect(label.htmlFor).toBe(input.id);
  });

  it('should use explicit id input when provided', async () => {
    fixture.componentRef.setInput('id', 'custom-checkbox-id');
    await fixture.whenStable();
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

    expect(input.id).toBe('custom-checkbox-id');
    expect(label.htmlFor).toBe('custom-checkbox-id');
  });

  it('should bind checked and disabled inputs', async () => {
    fixture.componentRef.setInput('checked', true);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    fixture.detectChanges();

    const label = fixture.debugElement.query(By.css('label')).nativeElement as HTMLLabelElement;
    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;

    expect(input.checked).toBe(true);
    expect(input.disabled).toBe(true);
    expect(label.classList).toContain('admin-checkbox-option-disabled');
  });

  it('should emit checkedChange on input change', () => {
    const emittedValues: boolean[] = [];
    component.checkedChange.subscribe((value) => emittedValues.push(value));

    const input = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
    input.checked = true;
    input.dispatchEvent(new Event('change'));

    expect(emittedValues).toEqual([true]);
  });
});
