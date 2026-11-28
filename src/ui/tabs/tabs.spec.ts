import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TabItem } from './models/tab-item.model';
import { Tabs } from './tabs';

describe('Tabs', () => {
  let fixture: ComponentFixture<Tabs>;
  let element: HTMLElement;

  const items: TabItem[] = [
    { value: 'revenue', label: 'Виручка', icon: 'payments' },
    { value: 'products', label: 'Товари', countLabel: '12' },
  ];

  const buttons = (): HTMLButtonElement[] =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.tab'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Tabs],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(Tabs);
    fixture.componentRef.setInput('items', items);
    fixture.componentRef.setInput('selectedValue', 'revenue');
    fixture.componentRef.setInput('ariaLabel', 'Звіти');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders every tab with icon, label and counter', () => {
    expect(buttons().map((button) => button.textContent?.trim())).toEqual([
      'paymentsВиручка',
      'Товари12',
    ]);
    expect(element.querySelector('[role="tablist"]')?.getAttribute('aria-label')).toBe('Звіти');
    expect(element.querySelectorAll('.tab-icon')).toHaveLength(1);
    expect(element.querySelectorAll('app-badge')).toHaveLength(1);
  });

  it('marks the selected tab', () => {
    expect(buttons()[0].classList).toContain('tab-active');
    expect(buttons()[0].getAttribute('aria-selected')).toBe('true');
    expect(buttons()[1].getAttribute('aria-selected')).toBe('false');
  });

  it('emits a new value on click and ignores the selected one', () => {
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((value) => emitted.push(value));

    buttons()[0].click();
    buttons()[1].click();

    expect(emitted).toEqual(['products']);
  });

  it('omits aria-label when it is empty', async () => {
    fixture.componentRef.setInput('ariaLabel', '');
    await fixture.whenStable();

    expect(element.querySelector('[role="tablist"]')?.hasAttribute('aria-label')).toBe(false);
  });
});
