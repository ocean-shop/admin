import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Dropdown } from '@ui/dropdown/dropdown';
import { DropdownOption } from '@ui/dropdown/models/dropdown.type';
import { FilterDropdown } from './filter-dropdown';

describe('FilterDropdown', () => {
  let fixture: ComponentFixture<FilterDropdown>;
  const options: DropdownOption[] = [
    { label: 'Newest', value: 'newest' },
    { label: 'Older', value: 'older' },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterDropdown],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterDropdown);
    fixture.componentRef.setInput('label', 'Sort');
    fixture.componentRef.setInput('options', options);
    fixture.componentRef.setInput('value', 'older');
    await fixture.whenStable();
  });

  it('renders the label', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('.filter-dropdown-label')?.textContent?.trim()).toBe('Sort');
  });

  it('passes options and value to the dropdown', () => {
    const dropdown = fixture.debugElement.query(By.directive(Dropdown))
      .componentInstance as Dropdown;

    expect(dropdown.options()).toEqual(options);
    expect(dropdown.value()).toBe('older');
  });

  it('re-emits the selected option', () => {
    const emitted: DropdownOption[] = [];
    fixture.componentInstance.optionSelected.subscribe((option) => emitted.push(option));
    const dropdown = fixture.debugElement.query(By.directive(Dropdown))
      .componentInstance as Dropdown;

    dropdown.optionSelected.emit(options[0]);

    expect(emitted).toEqual([options[0]]);
  });
});
