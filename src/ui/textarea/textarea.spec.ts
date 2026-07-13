import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { Textarea } from './textarea';

describe('Textarea', () => {
  let component: Textarea;
  let fixture: ComponentFixture<Textarea>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Textarea],
    }).compileComponents();

    fixture = TestBed.createComponent(Textarea);
    component = fixture.componentInstance;

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

  it('should render a textarea', () => {
    const textareaElement = fixture.debugElement.query(By.css('textarea'))
      .nativeElement as HTMLTextAreaElement;

    expect(textareaElement).toBeTruthy();
    expect(textareaElement.rows).toBe(4);
  });
});
