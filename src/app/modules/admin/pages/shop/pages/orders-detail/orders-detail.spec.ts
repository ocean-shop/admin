import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { ORDER_STATUS_LABELS, ORDERS_TEXTS } from '../orders/constants/orders.constants';
import { OrderPaymentStatus } from '../orders/models/order-payment-status.enum';
import { OrderStatus } from '../orders/models/order-status.enum';
import { OrdersService } from '../orders/services/orders/orders.service';
import { OrdersDetail } from './orders-detail';

describe('OrdersDetail', () => {
  let fixture: ComponentFixture<OrdersDetail>;
  let component: OrdersDetail;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockOrdersService: {
    getOrderById: ReturnType<typeof vi.fn>;
    updateOrderPaymentStatus: ReturnType<typeof vi.fn>;
    updateOrderStatus: ReturnType<typeof vi.fn>;
  };
  let mockToasterService: {
    success: ReturnType<typeof vi.fn>;
    danger: ReturnType<typeof vi.fn>;
  };
  const flush = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1', orderId: 'order-1' }));
    mockOrdersService = {
      getOrderById: vi.fn().mockReturnValue(
        of({
          id: 'order-1',
          shopId: 'shop-1',
          orderNumber: '1001',
          totalAmount: 230.5,
          paymentStatus: OrderPaymentStatus.Unpaid,
          status: OrderStatus.Pending,
          createdAt: '2026-08-10T11:12:13.000Z',
          updatedAt: '2026-08-11T11:12:13.000Z',
          items: [
            {
              id: 'item-1',
              productId: 'product-1',
              name: 'Coastal Shirt',
              sku: 'CS-100',
              quantity: 2,
              price: 115.25,
              total: 230.5,
            },
          ],
          user: {
            id: 'user-1',
            email: 'john@example.com',
            firstName: 'John',
            lastName: 'Doe',
          },
        }),
      ),
      updateOrderPaymentStatus: vi.fn().mockReturnValue(of({ id: 'order-1' })),
      updateOrderStatus: vi.fn().mockReturnValue(of({ id: 'order-1' })),
    };
    mockToasterService = {
      success: vi.fn(),
      danger: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [OrdersDetail],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: ToasterService, useValue: mockToasterService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ shopId: 'shop-1', orderId: 'order-1' }),
            },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersDetail);
    component = fixture.componentInstance;
    await flush();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads order by current id', () => {
    expect(mockOrdersService.getOrderById).toHaveBeenCalledWith('order-1');
  });

  it('renders order sections data', async () => {
    await flush();
    expect((component as any).orderInfoRows().length).toBeGreaterThan(0);
    expect((component as any).orderItemRows()).toHaveLength(1);
    expect((component as any).itemsCount()).toBe('1');
    expect((component as any).customerRows()[0].value).toBe('John Doe');
    expect((component as any).summaryRows().at(-1).value).toBe('230.50');
    expect((component as any).customer()).toEqual({
      name: 'John Doe',
      email: 'john@example.com',
      initials: 'JD',
    });
  });

  it('shows the order number, status and creation info in the header', async () => {
    await flush();
    const element = fixture.nativeElement as HTMLElement;

    expect((component as any).pageTitle()).toBe(`${ORDERS_TEXTS.DETAILS_ORDER_TITLE} №1001`);
    expect((component as any).pageDescription()).toContain('john@example.com');
    expect((component as any).statusTone()).toBe('warning');
    expect(element.querySelector('.page-header-title app-badge')?.textContent).toContain(
      ORDER_STATUS_LABELS[OrderStatus.Pending],
    );
    expect((component as any).breadcrumbItems().at(-1).label).toBe('№1001');
  });

  it('saves only the changed payment status', async () => {
    await flush();
    (component as any).selectedPaymentStatus.set(OrderPaymentStatus.Paid);

    (component as any).onSaveStatuses();
    await flush();

    expect(mockOrdersService.updateOrderPaymentStatus).toHaveBeenCalledWith('order-1', {
      paymentStatus: OrderPaymentStatus.Paid,
    });
    expect(mockOrdersService.updateOrderStatus).not.toHaveBeenCalled();
    expect(mockToasterService.success).toHaveBeenCalledWith(ORDERS_TEXTS.STATUSES_UPDATED_TITLE);
  });

  it('saves only the changed order status', async () => {
    await flush();
    (component as any).selectedOrderStatus.set(OrderStatus.Processing);

    (component as any).onSaveStatuses();
    await flush();

    expect(mockOrdersService.updateOrderStatus).toHaveBeenCalledWith('order-1', {
      status: OrderStatus.Processing,
    });
    expect(mockOrdersService.updateOrderPaymentStatus).not.toHaveBeenCalled();
  });

  it('saves both statuses with one action', async () => {
    await flush();
    (component as any).selectedPaymentStatus.set(OrderPaymentStatus.Paid);
    (component as any).selectedOrderStatus.set(OrderStatus.Shipped);

    (component as any).onSaveStatuses();
    await flush();

    expect(mockOrdersService.updateOrderPaymentStatus).toHaveBeenCalledTimes(1);
    expect(mockOrdersService.updateOrderStatus).toHaveBeenCalledTimes(1);
    expect(mockToasterService.success).toHaveBeenCalledTimes(1);
  });

  it('applies valid dropdown selections only', () => {
    (component as any).onPaymentStatusSelected({ label: 'x', value: OrderPaymentStatus.Paid });
    (component as any).onStatusSelected({ label: 'x', value: OrderStatus.Cancelled });
    (component as any).onStatusSelected({ label: 'x', value: 'weird' });

    expect((component as any).selectedPaymentStatus()).toBe(OrderPaymentStatus.Paid);
    expect((component as any).selectedOrderStatus()).toBe(OrderStatus.Cancelled);
  });

  it('guards saving while values are unchanged', () => {
    (component as any).selectedPaymentStatus.set(OrderPaymentStatus.Unpaid);
    (component as any).selectedOrderStatus.set(OrderStatus.Pending);

    expect((component as any).canSaveStatuses()).toBe(false);
    (component as any).onSaveStatuses();

    expect(mockOrdersService.updateOrderPaymentStatus).not.toHaveBeenCalled();
    expect(mockOrdersService.updateOrderStatus).not.toHaveBeenCalled();
  });
});
