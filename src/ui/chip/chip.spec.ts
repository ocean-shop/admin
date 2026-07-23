import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Chip } from './chip';

describe('Chip', () => {
  let fixture: ComponentFixture<Chip>;
  let component: Chip;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Chip],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Chip);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Material: Linen');
    fixture.componentRef.setInput('removeAriaLabel', 'Remove attribute');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders label text', () => {
    const chipElement = fixture.debugElement.query(By.css('.chip')).nativeElement as HTMLElement;

    expect(chipElement.textContent).toContain('Material: Linen');
  });

  it('applies attribute variant by default', () => {
    const chipElement = fixture.debugElement.query(By.css('.chip')).nativeElement as HTMLElement;

    expect(chipElement.className).toContain('chip-attribute');
  });

  it('applies tag variant class', async () => {
    fixture.componentRef.setInput('variant', 'tag');
    await fixture.whenStable();
    fixture.detectChanges();
    const chipElement = fixture.debugElement.query(By.css('.chip')).nativeElement as HTMLElement;

    expect(chipElement.className).toContain('chip-tag');
  });

  it('emits remove on button click', () => {
    const removeSpy = vi.spyOn((component as any).remove, 'emit');
    const buttonElement = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;

    buttonElement.click();

    expect(removeSpy).toHaveBeenCalled();
  });

  it('does not emit remove when disabled', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();
    fixture.detectChanges();
    const removeSpy = vi.spyOn((component as any).remove, 'emit');
    const buttonElement = fixture.debugElement.query(By.css('button'))
      .nativeElement as HTMLButtonElement;

    buttonElement.click();

    expect(removeSpy).not.toHaveBeenCalled();
    expect(buttonElement.disabled).toBe(true);
  });
});
