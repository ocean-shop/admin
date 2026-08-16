import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { OrderPaymentStatus } from '../orders/models/order-payment-status.enum';
import { OrderStatus } from '../orders/models/order-status.enum';
import { OrdersService } from '../orders/services/orders.service';
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
    expect((component as any).userInfoRows()[1].value).toBe('John');
  });

  it('updates payment status with selected value', async () => {
    await flush();
    (component as any).selectedPaymentStatus.set(OrderPaymentStatus.Paid);

    (component as any).onSavePaymentStatus();
    await fixture.whenStable();

    expect(mockOrdersService.updateOrderPaymentStatus).toHaveBeenCalledWith('order-1', {
      paymentStatus: OrderPaymentStatus.Paid,
    });
  });

  it('updates order status with selected value', async () => {
    await flush();
    (component as any).selectedOrderStatus.set(OrderStatus.Processing);

    (component as any).onSaveStatus();
    await fixture.whenStable();

    expect(mockOrdersService.updateOrderStatus).toHaveBeenCalledWith('order-1', {
      status: OrderStatus.Processing,
    });
  });

  it('guards save actions while values are unchanged', () => {
    (component as any).selectedPaymentStatus.set(OrderPaymentStatus.Unpaid);
    (component as any).selectedOrderStatus.set(OrderStatus.Pending);

    (component as any).onSavePaymentStatus();
    (component as any).onSaveStatus();

    expect(mockOrdersService.updateOrderPaymentStatus).not.toHaveBeenCalled();
    expect(mockOrdersService.updateOrderStatus).not.toHaveBeenCalled();
  });
});
