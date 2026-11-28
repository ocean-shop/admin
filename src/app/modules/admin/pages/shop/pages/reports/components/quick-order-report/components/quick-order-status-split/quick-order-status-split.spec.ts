import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QUICK_ORDER_REPORT_TEXTS } from '../../../../constants/quick-order-report.constants';
import { QuickOrderStatusSplitView } from '../../../../models/quick-order-report-view.model';
import { QuickOrderStatusSplit } from './quick-order-status-split';

describe('QuickOrderStatusSplit', () => {
  let fixture: ComponentFixture<QuickOrderStatusSplit>;
  let element: HTMLElement;

  const split: QuickOrderStatusSplitView = {
    description: 'Усього 10 заявок за період',
    segments: [
      { value: 0.5, tone: 'primary', label: 'Оброблені · 50%' },
      { value: 0.3, tone: 'secondary', label: 'Нові · 30%' },
      { value: 0.2, tone: 'warning', label: 'Скасовані · 20%' },
    ],
    ariaLabel: 'Оброблені · 50%, Нові · 30%, Скасовані · 20%',
    metrics: [
      { id: 'processed', label: 'Оброблені', value: '5 заявок', caption: '≈ 5 000 ₴' },
      { id: 'new', label: 'Нові', value: '3 заявки', caption: '≈ 3 000 ₴' },
      { id: 'cancelled', label: 'Скасовані', value: '2 заявки', caption: '≈ 1 500 ₴' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickOrderStatusSplit],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickOrderStatusSplit);
    fixture.componentRef.setInput('split', split);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the status bar and metrics', () => {
    expect(element.querySelector('.section-card-title')?.textContent).toContain(
      QUICK_ORDER_REPORT_TEXTS.STATUS_TITLE,
    );
    expect(element.querySelector('.section-card-description')?.textContent).toContain(
      split.description,
    );
    expect(element.querySelector('.share-bar')?.getAttribute('aria-label')).toBe(split.ariaLabel);
    expect(
      Array.from(element.querySelectorAll('.split-metric-value')).map((node) => node.textContent),
    ).toEqual(['5 заявок', '3 заявки', '2 заявки']);
    expect(element.querySelector('.split-metric-caption')?.textContent).toContain('≈ 5 000 ₴');
  });
});
