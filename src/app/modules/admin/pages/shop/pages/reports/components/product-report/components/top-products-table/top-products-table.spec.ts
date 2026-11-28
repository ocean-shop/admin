import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PRODUCT_REPORT_TEXTS } from '../../../../constants/product-report.constants';
import { TopProductRow } from '../../../../models/product-report-view.model';
import { TopProductsTable } from './top-products-table';

const buildRow = (productId: string, rank: number, abcClass: 'A' | 'B' | 'C'): TopProductRow => ({
  productId,
  rank,
  name: `Товар ${rank}`,
  abcClass,
  revenue: '1 000 ₴',
  shareLabel: '10,0%',
  cumulativeBar: [{ value: 0.5, tone: 'primary' }],
  cumulativeLabel: '50%',
  unitsLabel: '2 шт.',
  ordersLabel: '1',
});

describe('TopProductsTable', () => {
  let fixture: ComponentFixture<TopProductsTable>;
  let element: HTMLElement;

  const bodyRows = (): HTMLTableRowElement[] =>
    Array.from(element.querySelectorAll<HTMLTableRowElement>('tbody tr'));
  const tabs = (): HTMLButtonElement[] =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('.tab'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopProductsTable],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(TopProductsTable);
    fixture.componentRef.setInput('rows', [
      buildRow('p-1', 1, 'A'),
      buildRow('p-2', 2, 'B'),
      buildRow('', 3, 'C'),
    ]);
    fixture.componentRef.setInput('productsSold', 13);
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  });

  it('renders all rows with the shown caption', () => {
    expect(bodyRows()).toHaveLength(3);
    expect(element.querySelector('.report-table-caption')?.textContent).toBe(
      `${PRODUCT_REPORT_TEXTS.TOP_SHOWN_PREFIX} 3 ${PRODUCT_REPORT_TEXTS.TOP_SHOWN_JOINER} 13 ${PRODUCT_REPORT_TEXTS.TOP_SHOWN_SUFFIX}`,
    );
    expect(element.querySelector('.abc-key-a')?.textContent).toContain('A');
    expect(element.querySelector('.abc-key-b')?.textContent).toContain('B');
    expect(element.querySelector('.cumulative-label')?.textContent).toContain('50%');
  });

  it('filters rows by ABC class', async () => {
    tabs()[1].click();
    await fixture.whenStable();

    expect(bodyRows()).toHaveLength(1);
    expect(bodyRows()[0].textContent).toContain('Товар 1');
  });

  it('shows the empty text when nothing matches', async () => {
    fixture.componentRef.setInput('rows', [buildRow('p-1', 1, 'A')]);
    await fixture.whenStable();
    tabs()[3].click();
    await fixture.whenStable();

    expect(element.querySelector('table')).toBeNull();
    expect(element.textContent).toContain(PRODUCT_REPORT_TEXTS.TOP_EMPTY);
  });

  it('ignores unknown filter values', () => {
    (fixture.componentInstance as any).onFilterChange('D');

    expect((fixture.componentInstance as any).filter()).toBe('all');
  });

  it('emits the product id and skips rows without one', () => {
    const opened: string[] = [];
    fixture.componentInstance.openProduct.subscribe((id) => opened.push(id));

    const links = element.querySelectorAll<HTMLButtonElement>('.report-table-link');
    links[0].click();
    links[2].click();

    expect(opened).toEqual(['p-1']);
  });
});
