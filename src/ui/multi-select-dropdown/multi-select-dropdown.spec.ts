import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MultiSelectDropdown } from './multi-select-dropdown';

describe('MultiSelectDropdown', () => {
  let fixture: ComponentFixture<MultiSelectDropdown>;
  let component: MultiSelectDropdown;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiSelectDropdown],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(MultiSelectDropdown);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Select shops');
    fixture.componentRef.setInput('variant', 'form');
    fixture.componentRef.setInput('options', [
      { label: 'Shop One', value: 'shop-1' },
      { label: 'Shop Two', value: 'shop-2' },
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows default label when no values are selected', () => {
    const triggerText = (fixture.nativeElement as HTMLElement)
      .querySelector('.multi-select-trigger-label')
      ?.textContent?.trim();

    expect(triggerText).toBe('Select shops');
  });

  it('toggles selected values when option is clicked', () => {
    fixture.debugElement.query(By.css('.multi-select-trigger')).nativeElement.click();
    fixture.detectChanges();

    const firstOption = fixture.debugElement.queryAll(By.css('.multi-select-item'))[0];
    firstOption.nativeElement.click();
    fixture.detectChanges();

    expect(component.value()).toEqual(['shop-1']);

    firstOption.nativeElement.click();
    fixture.detectChanges();

    expect(component.value()).toEqual([]);
  });

  it('shows selected count when multiple values are selected', () => {
    component.value.set(['shop-1', 'shop-2']);
    fixture.detectChanges();

    const triggerText = (fixture.nativeElement as HTMLElement)
      .querySelector('.multi-select-trigger-label')
      ?.textContent?.trim();

    expect(triggerText).toBe('2 selected');
  });
});
