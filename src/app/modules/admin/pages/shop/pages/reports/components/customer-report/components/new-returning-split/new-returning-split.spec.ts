import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOMER_REPORT_TEXTS } from '../../../../constants/customer-report.constants';
import { CustomerSplitView } from '../../../../models/customer-report-view.model';
import { NewReturningSplit } from './new-returning-split';

describe('NewReturningSplit', () => {
  let fixture: ComponentFixture<NewReturningSplit>;
  let element: HTMLElement;

  const split: CustomerSplitView = {
    description: 'Чиста виручка 100 ₴ за період',
    segments: [
      { value: 0.6, tone: 'primary', label: 'Нові · 60%' },
      { value: 0.4, tone: 'secondary', label: 'Повторні · 40%' },
    ],
    ariaLabel: 'Нові · 60%, Повторні · 40%',
    metrics: [
      { id: 'new', label: CUSTOMER_REPORT_TEXTS.SPLIT_NEW, value: '60 ₴', caption: '3 клієнти' },
      {
        id: 'returning',
        label: CUSTOMER_REPORT_TEXTS.SPLIT_RETURNING,
        value: '40 ₴',
        caption: '1 клієнт',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewReturningSplit],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(NewReturningSplit);
    fixture.componentRef.setInput('split', split);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the split bar and metrics', () => {
    expect(element.querySelector('.section-card-title')?.textContent).toContain(
      CUSTOMER_REPORT_TEXTS.SPLIT_TITLE,
    );
    expect(element.querySelector('.section-card-description')?.textContent).toContain(
      split.description,
    );
    expect(element.querySelector('.share-bar')?.getAttribute('aria-label')).toBe(split.ariaLabel);
    expect(
      Array.from(element.querySelectorAll('.split-metric-value')).map((node) => node.textContent),
    ).toEqual(['60 ₴', '40 ₴']);
    expect(element.querySelector('.split-metric-caption')?.textContent).toContain('3 клієнти');
  });
});
