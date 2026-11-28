import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCT_REPORT_TEXTS } from '../../../../constants/product-report.constants';
import { ProductTrendList } from '../../../../models/product-report-view.model';
import { ProductTrends } from './product-trends';

describe('ProductTrends', () => {
  let fixture: ComponentFixture<ProductTrends>;
  let element: HTMLElement;

  const trend: ProductTrendList = {
    kind: 'growing',
    title: PRODUCT_REPORT_TEXTS.GROWING_TITLE,
    icon: 'trending_up',
    emptyText: PRODUCT_REPORT_TEXTS.GROWING_EMPTY,
    rows: [
      {
        productId: 'p-1',
        name: 'Навушники',
        revenue: '6 300 ₴',
        change: { label: '+65,0%', direction: 'up', tone: 'success' },
      },
      {
        productId: '',
        name: 'Без id',
        revenue: '0 ₴',
        change: { label: 'Новий', direction: 'up', tone: 'success' },
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductTrends],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductTrends);
    fixture.componentRef.setInput('trend', trend);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders products with changes', () => {
    expect(element.querySelector('.section-card-title')?.textContent).toContain(
      PRODUCT_REPORT_TEXTS.GROWING_TITLE,
    );
    expect(element.querySelectorAll('.trend-row')).toHaveLength(2);
    expect(element.querySelector('.trend-revenue')?.textContent).toContain('6 300 ₴');
    expect(element.querySelector('app-change-badge')?.textContent).toContain('+65,0%');
  });

  it('emits product ids, skipping empty ones', () => {
    const opened: string[] = [];
    fixture.componentInstance.openProduct.subscribe((id) => opened.push(id));

    element.querySelectorAll<HTMLButtonElement>('.trend-name').forEach((button) => button.click());

    expect(opened).toEqual(['p-1']);
  });

  it('shows the empty text', async () => {
    fixture.componentRef.setInput('trend', { ...trend, rows: [] });
    await fixture.whenStable();

    expect(element.textContent).toContain(PRODUCT_REPORT_TEXTS.GROWING_EMPTY);
  });
});
