import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Input } from './input';

describe('Input', () => {
  let component: Input;
  let fixture: ComponentFixture<Input>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Input],
    }).compileComponents();

    fixture = TestBed.createComponent(Input);
    component = fixture.componentInstance;

    // We need an actual signal form field for testing since [formField] requires the internal API
    TestBed.runInInjectionContext(() => {
      const mockModel = signal({ testField: '' });
      const mockForm = form(mockModel);

      fixture.componentRef.setInput('id', 'test-id');
      fixture.componentRef.setInput('control', mockForm.testField);
    });

    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a text input', () => {
    const inputElement = fixture.debugElement.query(By.css('input'))
      .nativeElement as HTMLInputElement;

    expect(inputElement).toBeTruthy();
    expect(inputElement.type).toBe('text');
  });
});
