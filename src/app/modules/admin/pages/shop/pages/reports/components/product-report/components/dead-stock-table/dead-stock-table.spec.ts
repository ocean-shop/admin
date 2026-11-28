import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCT_REPORT_TEXTS } from '../../../../constants/product-report.constants';
import { DeadStockView } from '../../../../models/product-report-view.model';
import { DeadStockTable } from './dead-stock-table';

describe('DeadStockTable', () => {
  let fixture: ComponentFixture<DeadStockTable>;
  let element: HTMLElement;

  const deadStock: DeadStockView = {
    days: 60,
    total: 5,
    rows: [
      {
        productId: 'p-1',
        name: 'Iphone 3gs',
        price: '1 000 ₴',
        lastSoldLabel: PRODUCT_REPORT_TEXTS.DEAD_STOCK_NEVER_SOLD,
        daysLabel: '—',
      },
      { productId: '', name: 'Без id', price: '0 ₴', lastSoldLabel: '01.09.2026', daysLabel: '87' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeadStockTable],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DeadStockTable);
    fixture.componentRef.setInput('deadStock', deadStock);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders the heading with total and days', () => {
    expect(element.querySelector('.report-table-title')?.textContent).toContain(
      PRODUCT_REPORT_TEXTS.DEAD_STOCK_TITLE,
    );
    expect(element.querySelector('app-badge')?.textContent).toContain('5');
    expect(element.querySelector('.report-table-description')?.textContent).toBe(
      `${PRODUCT_REPORT_TEXTS.DEAD_STOCK_DESCRIPTION_PREFIX} 60 днів.`,
    );
    expect(element.querySelectorAll('tbody tr')).toHaveLength(2);
  });

  it('emits the product id and disables rows without one', () => {
    const opened: string[] = [];
    fixture.componentInstance.openProduct.subscribe((id) => opened.push(id));
    const buttons = element.querySelectorAll<HTMLButtonElement>('app-button button');

    buttons[0].click();

    expect(opened).toEqual(['p-1']);
    expect(buttons[1].disabled).toBe(true);
    (fixture.componentInstance as any).onOpenProduct('');
    expect(opened).toEqual(['p-1']);
  });

  it('shows the empty state without rows', async () => {
    fixture.componentRef.setInput('deadStock', { days: 30, total: 0, rows: [] });
    await fixture.whenStable();

    expect(element.querySelector('table')).toBeNull();
    expect(element.textContent).toContain(PRODUCT_REPORT_TEXTS.DEAD_STOCK_EMPTY_TITLE);
    expect(element.textContent).toContain(
      `${PRODUCT_REPORT_TEXTS.DEAD_STOCK_EMPTY_PREFIX} 30 днів.`,
    );
  });
});
