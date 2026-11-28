import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QUICK_ORDER_REPORT_TEXTS } from '../../../../constants/quick-order-report.constants';
import { QuickOrderProductRow } from '../../../../models/quick-order-report-view.model';
import { QuickOrderProductsTable } from './quick-order-products-table';

const buildRow = (productId: string, rank: number): QuickOrderProductRow => ({
  productId,
  rank,
  name: `Товар ${rank}`,
  requestsLabel: '4',
  shareLabel: '50%',
  shareBar: [{ value: 0.5, tone: 'primary' }],
  price: '1 000 ₴',
  estimatedValue: '≈ 4 000 ₴',
});

describe('QuickOrderProductsTable', () => {
  let fixture: ComponentFixture<QuickOrderProductsTable>;
  let element: HTMLElement;

  const bodyRows = (): HTMLTableRowElement[] =>
    Array.from(element.querySelectorAll<HTMLTableRowElement>('tbody tr'));
  const links = (): HTMLButtonElement[] =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.report-table-link'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickOrderProductsTable],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickOrderProductsTable);
    fixture.componentRef.setInput('rows', [buildRow('p-1', 1), buildRow('', 2)]);
    fixture.componentRef.setInput('caption', 'Показано 2 товари');
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders rows with the caption', () => {
    expect(element.querySelector('.report-table-title')?.textContent).toContain(
      QUICK_ORDER_REPORT_TEXTS.PRODUCTS_TITLE,
    );
    expect(element.querySelector('.report-table-caption')?.textContent).toBe('Показано 2 товари');
    expect(bodyRows()).toHaveLength(2);
    expect(bodyRows()[0].textContent).toContain('Товар 1');
    expect(bodyRows()[0].textContent).toContain('≈ 4 000 ₴');
    expect(element.querySelector('.share-label')?.textContent).toContain('50%');
  });

  it('shows the empty text without rows', async () => {
    fixture.componentRef.setInput('rows', []);
    await fixture.whenStable();

    expect(element.querySelector('table')).toBeNull();
    expect(element.querySelector('.report-table-caption')).toBeNull();
    expect(element.textContent).toContain(QUICK_ORDER_REPORT_TEXTS.PRODUCTS_EMPTY);
  });

  it('emits the product id and skips rows without one', () => {
    const emitted: string[] = [];
    fixture.componentInstance.openProduct.subscribe((id) => emitted.push(id));

    links()[0].click();
    links()[1].click();

    expect(emitted).toEqual(['p-1']);
  });
});
