import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterInput } from './filter-input';

describe('FilterInput', () => {
  let fixture: ComponentFixture<FilterInput>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterInput],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(FilterInput);
    fixture.componentRef.setInput('inputId', 'name-filter');
    fixture.componentRef.setInput('label', 'Name');
    fixture.componentRef.setInput('placeholder', 'Search');
    fixture.componentRef.setInput('value', 'Shoes');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('links the label to the input', () => {
    const label = element.querySelector('label') as HTMLLabelElement;
    const inputElement = element.querySelector('input') as HTMLInputElement;

    expect(label.htmlFor).toBe('name-filter');
    expect(inputElement.id).toBe('name-filter');
    expect(label.textContent?.trim()).toBe('Name');
  });

  it('renders value and placeholder', () => {
    const inputElement = element.querySelector('input') as HTMLInputElement;

    expect(inputElement.value).toBe('Shoes');
    expect(inputElement.placeholder).toBe('Search');
  });

  it('emits typed values', () => {
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));
    const inputElement = element.querySelector('input') as HTMLInputElement;

    inputElement.value = 'Hats';
    inputElement.dispatchEvent(new Event('input'));

    expect(emitted).toEqual(['Hats']);
  });

  it('disables the input', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    expect((element.querySelector('input') as HTMLInputElement).disabled).toBe(true);
  });
});
