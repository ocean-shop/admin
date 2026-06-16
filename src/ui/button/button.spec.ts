import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Button } from './button';

describe('Button', () => {
  let component: Button;
  let fixture: ComponentFixture<Button>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Button');
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
    expect(buttonElement.textContent).toContain('Test Button');
  });

  it('should apply base button utility classes', () => {
    const buttonElement = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;

    expect(buttonElement.className).toContain('admin-btn');
  });
});
