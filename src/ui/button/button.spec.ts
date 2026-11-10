import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
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

describe('Button variants', () => {
  let fixture: ComponentFixture<Button>;

  const buttonElement = (): HTMLButtonElement =>
    fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Button],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Button);
    fixture.componentRef.setInput('label', 'Зберегти');
    await fixture.whenStable();
  });

  it.each([
    ['secondary', 'admin-btn-secondary'],
    ['outline', 'admin-btn-outline'],
    ['ghost', 'admin-btn-ghost'],
    ['danger', 'admin-btn-danger'],
  ])('applies the %s variant class', async (variant, className) => {
    fixture.componentRef.setInput('variant', variant);
    await fixture.whenStable();

    expect(buttonElement().classList).toContain(className);
  });

  it('applies size classes and full-width host class', async () => {
    fixture.componentRef.setInput('size', 'sm');
    await fixture.whenStable();
    expect(buttonElement().classList).toContain('admin-btn-sm');
    expect((fixture.nativeElement as HTMLElement).classList).toContain('admin-btn-host-full');

    fixture.componentRef.setInput('size', 'lg');
    fixture.componentRef.setInput('fullWidth', false);
    await fixture.whenStable();
    expect(buttonElement().classList).toContain('admin-btn-lg');
    expect((fixture.nativeElement as HTMLElement).classList).not.toContain('admin-btn-host-full');
  });

  it('renders leading and trailing icons', async () => {
    fixture.componentRef.setInput('icon', 'add');
    await fixture.whenStable();
    expect(buttonElement().classList).toContain('admin-btn-trailing');

    fixture.componentRef.setInput('iconLeading', true);
    await fixture.whenStable();
    expect(buttonElement().classList).not.toContain('admin-btn-trailing');
    expect(buttonElement().firstElementChild?.textContent).toContain('add');
  });

  it('disables the button and shows a spinner while loading', async () => {
    fixture.componentRef.setInput('icon', 'save');
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();

    expect(buttonElement().disabled).toBe(true);
    expect(buttonElement().getAttribute('aria-busy')).toBe('true');
    expect(buttonElement().querySelector('.admin-btn-spin')).toBeTruthy();
    expect(buttonElement().querySelector('.admin-btn-icon')).toBeNull();
  });
});
