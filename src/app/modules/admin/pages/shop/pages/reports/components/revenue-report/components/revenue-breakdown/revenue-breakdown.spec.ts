import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { REVENUE_REPORT_TEXTS } from '../../../../constants/revenue-report.constants';
import { RevenueBreakdown as RevenueBreakdownData } from '../../../../models/revenue-report-view.model';
import { RevenueBreakdown } from './revenue-breakdown';

describe('RevenueBreakdown', () => {
  let fixture: ComponentFixture<RevenueBreakdown>;
  let element: HTMLElement;

  const breakdown: RevenueBreakdownData = {
    id: 'payment',
    title: REVENUE_REPORT_TEXTS.BY_PAYMENT_TITLE,
    icon: 'credit_card',
    rows: [
      {
        key: 'card',
        name: 'Картка',
        amount: '131 760 ₴',
        metaLabel: '60% · 98 замовлень',
        bar: [{ value: 0.6, tone: 'primary' }],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevenueBreakdown],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RevenueBreakdown);
    fixture.componentRef.setInput('breakdown', breakdown);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders rows with amount, share and bar width', () => {
    expect(element.querySelector('.section-card-title')?.textContent).toContain(
      REVENUE_REPORT_TEXTS.BY_PAYMENT_TITLE,
    );
    expect(element.querySelector('.breakdown-name')?.textContent).toContain('Картка');
    expect(element.querySelector('.breakdown-amount')?.textContent).toContain('131 760 ₴');
    expect(element.querySelector('.breakdown-meta')?.textContent).toContain('60% · 98 замовлень');
    expect((element.querySelector('.share-bar-segment') as HTMLElement).style.width).toBe('60%');
  });

  it('shows an empty text without rows', async () => {
    fixture.componentRef.setInput('breakdown', { ...breakdown, rows: [] });
    await fixture.whenStable();

    expect(element.querySelector('.breakdown-list')).toBeNull();
    expect(element.textContent).toContain(REVENUE_REPORT_TEXTS.BREAKDOWN_EMPTY);
  });
});
