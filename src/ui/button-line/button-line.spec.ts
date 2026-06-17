import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonLine } from './button-line';

describe('ButtonLine', () => {
  let component: ButtonLine;
  let fixture: ComponentFixture<ButtonLine>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonLine],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonLine);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Button Line');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render button with label', () => {
    const buttonElement = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;

    expect(buttonElement).toBeTruthy();
    expect(buttonElement.type).toBe('button');
    expect(buttonElement.textContent?.trim()).toBe('Test Button Line');
  });

  it('should apply base button utility classes', () => {
    const buttonElement = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;

    expect(buttonElement.className).toContain('button-line');
    expect(buttonElement.className).toContain('ripple');
  });

  it('should set button type correctly when provided', async () => {
    fixture.componentRef.setInput('type', 'submit');
    await fixture.whenStable();
    fixture.detectChanges();

    const buttonElement = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;

    expect(buttonElement.type).toBe('submit');
  });
});
