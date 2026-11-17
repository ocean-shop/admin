import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QUICK_ORDERS_TEXTS } from '../../constants/quick-orders.constants';
import { QuickOrderStatus } from '../../models/quick-order-status.enum';
import { QuickOrder } from '../../models/quick-order.model';
import { QuickOrdersTable } from './quick-orders-table';

const buildOrder = (overrides: Partial<QuickOrder> = {}): QuickOrder => ({
  id: 'q-1',
  name: 'Олена Коваль',
  phone: '+380 67 123 45 67',
  phoneHref: 'tel:+380671234567',
  productId: 'p-1',
  productName: 'Iphone 14 pro max',
  status: QuickOrderStatus.New,
  statusLabel: 'Нове',
  statusTone: 'primary',
  createdDate: '17.11.2026',
  createdTime: '09:02',
  ...overrides,
});

describe('QuickOrdersTable', () => {
  let fixture: ComponentFixture<QuickOrdersTable>;
  let element: HTMLElement;

  const render = async (orders: QuickOrder[], extra: Record<string, unknown> = {}) => {
    fixture.componentRef.setInput('orders', orders);
    Object.entries(extra).forEach(([key, value]) => fixture.componentRef.setInput(key, value));
    await fixture.whenStable();
    element = fixture.nativeElement as HTMLElement;
  };

  const buttonByText = (text: string): HTMLButtonElement | undefined =>
    Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes(text),
    );

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickOrdersTable],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickOrdersTable);
  });

  it('renders the loading state', async () => {
    await render([], { loading: true });
    expect(element.textContent).toContain(QUICK_ORDERS_TEXTS.TABLE_LOADING_TEXT);
  });

  it('renders the empty state', async () => {
    await render([]);
    expect(element.textContent).toContain(QUICK_ORDERS_TEXTS.EMPTY_STATE);
  });

  it('renders row data with a tel link', async () => {
    await render([buildOrder()]);

    expect(element.textContent).toContain('Олена Коваль');
    expect(element.textContent).toContain('Iphone 14 pro max');
    expect(element.querySelector('a.quick-orders-phone')?.getAttribute('href')).toBe(
      'tel:+380671234567',
    );
  });

  it('renders plain phone and product name when links are unavailable', async () => {
    await render([buildOrder({ phoneHref: null, productId: null })]);

    expect(element.querySelector('a.quick-orders-phone')).toBeNull();
    expect(element.querySelector('.quick-orders-product-link')).toBeNull();
    expect(element.textContent).toContain('+380 67 123 45 67');
  });

  it('emits processed and cancelled status for new orders', async () => {
    const emitted: unknown[] = [];
    fixture.componentInstance.statusChange.subscribe((value) => emitted.push(value));
    await render([buildOrder()]);

    buttonByText(QUICK_ORDERS_TEXTS.PROCESS_LABEL)?.click();
    buttonByText(QUICK_ORDERS_TEXTS.CANCEL_LABEL)?.click();

    expect(emitted).toEqual([
      { id: 'q-1', status: QuickOrderStatus.Processed },
      { id: 'q-1', status: QuickOrderStatus.Cancelled },
    ]);
    expect(buttonByText(QUICK_ORDERS_TEXTS.RESTORE_LABEL)).toBeUndefined();
  });

  it('offers restore for handled orders', async () => {
    const emitted: unknown[] = [];
    fixture.componentInstance.statusChange.subscribe((value) => emitted.push(value));
    await render([buildOrder({ status: QuickOrderStatus.Cancelled })]);

    buttonByText(QUICK_ORDERS_TEXTS.RESTORE_LABEL)?.click();

    expect(emitted).toEqual([{ id: 'q-1', status: QuickOrderStatus.New }]);
    expect(buttonByText(QUICK_ORDERS_TEXTS.PROCESS_LABEL)).toBeUndefined();
  });

  it('does not emit while another change is pending', async () => {
    const emitSpy = vi.fn();
    fixture.componentInstance.statusChange.subscribe(emitSpy);
    await render([buildOrder()], { pendingOrderId: 'q-2' });

    (fixture.componentInstance as any).onStatusChange(buildOrder(), QuickOrderStatus.Processed);

    expect(emitSpy).not.toHaveBeenCalled();
    expect(buttonByText(QUICK_ORDERS_TEXTS.CANCEL_LABEL)?.disabled).toBe(true);
  });

  it('emits product id on product click and ignores rows without product', async () => {
    const emitted: string[] = [];
    fixture.componentInstance.openProduct.subscribe((value) => emitted.push(value));
    await render([buildOrder()]);

    (element.querySelector('.quick-orders-product-link') as HTMLButtonElement).click();
    (fixture.componentInstance as any).onOpenProduct(buildOrder({ productId: null }));

    expect(emitted).toEqual(['p-1']);
  });
});
