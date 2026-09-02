import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { RadioGroup } from './radio-group';
import { RadioGroupOption } from './models/radio-group-option.model';

describe('RadioGroup', () => {
  let fixture: ComponentFixture<RadioGroup>;
  let component: RadioGroup;

  const options: RadioGroupOption[] = [
    { id: 'option-yes', value: true, label: 'Yes' },
    { id: 'option-no', value: false, label: 'No', disabled: true },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadioGroup],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RadioGroup);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'approval');
    fixture.componentRef.setInput('options', options);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render all radio options with shared group name', () => {
    const inputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));

    expect(inputs.length).toBe(2);
    expect((inputs[0].nativeElement as HTMLInputElement).name).toBe('approval');
    expect((inputs[1].nativeElement as HTMLInputElement).name).toBe('approval');
  });

  it('should render legend when label is provided', async () => {
    fixture.componentRef.setInput('label', 'Select approval status');
    await fixture.whenStable();
    fixture.detectChanges();

    const legend = fixture.debugElement.query(By.css('legend')).nativeElement as HTMLLegendElement;

    expect(legend.textContent).toContain('Select approval status');
  });

  it('should check input matching selectedValue', async () => {
    fixture.componentRef.setInput('selectedValue', false);
    await fixture.whenStable();
    fixture.detectChanges();

    const inputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));
    const first = inputs[0].nativeElement as HTMLInputElement;
    const second = inputs[1].nativeElement as HTMLInputElement;

    expect(first.checked).toBe(false);
    expect(second.checked).toBe(true);
  });

  it('should disable all options when group is disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    fixture.detectChanges();

    const fieldset = fixture.debugElement.query(By.css('fieldset'))
      .nativeElement as HTMLFieldSetElement;
    const inputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));

    expect(fieldset.disabled).toBe(true);
    expect((inputs[0].nativeElement as HTMLInputElement).disabled).toBe(true);
    expect((inputs[1].nativeElement as HTMLInputElement).disabled).toBe(true);
  });

  it('should mark disabled option as disabled', () => {
    const labels = fixture.debugElement.queryAll(By.css('.admin-radio-option'));
    const inputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));

    expect(labels[1].nativeElement.classList).toContain('admin-radio-option-disabled');
    expect((inputs[1].nativeElement as HTMLInputElement).disabled).toBe(true);
  });

  it('should emit valueChange on option change', () => {
    const emittedValues: (string | number | boolean)[] = [];
    component.valueChange.subscribe((value) => emittedValues.push(value));

    const inputs = fixture.debugElement.queryAll(By.css('input[type="radio"]'));
    const first = inputs[0].nativeElement as HTMLInputElement;
    first.dispatchEvent(new Event('change'));

    expect(emittedValues).toEqual([true]);
  });
});
