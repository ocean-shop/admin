import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of } from 'rxjs';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { ORDERS_TEXTS } from './constants/orders.constants';
import { OrderListResponse } from './models/order.model';
import { Orders } from './orders';
import { OrdersService } from './services/orders.service';

describe('Orders', () => {
  let fixture: ComponentFixture<Orders>;
  let component: Orders;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockOrdersService: {
    getOrders: ReturnType<typeof vi.fn>;
    deleteOrder: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  const flush = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    fixture.detectChanges();
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject(convertToParamMap({ shopId: 'shop-1' }));
    const response: OrderListResponse = {
      items: [
        {
          id: 'order-1',
          shopId: 'shop-1',
          orderNumber: '1001',
          totalAmount: 230.5,
          paymentStatus: 'paid',
          status: 'processing',
          createdAt: '2026-08-10T11:12:13.000Z',
        },
      ],
      total: 25,
      page: 1,
      limit: 20,
      totalPages: 2,
    };

    mockOrdersService = {
      getOrders: vi.fn().mockReturnValue(of(response)),
      deleteOrder: vi.fn().mockReturnValue(of(void 0)),
    };
    mockRouter = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [Orders],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: OrdersService, useValue: mockOrdersService },
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ shopId: 'shop-1' }) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Orders);
    component = fixture.componentInstance;
    await flush();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders breadcrumbs for shop page', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
    expect(element.textContent).toContain('Головна');
    expect(element.textContent).toContain(ORDERS_TEXTS.PAGE_TITLE);
  });

  it('requests orders list with default params', () => {
    expect(mockOrdersService.getOrders).toHaveBeenCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('maps order rows for table columns', async () => {
    await flush();
    const rows = (component as any).orderRows();
    expect(rows).toHaveLength(1);
    expect(rows[0]['orderNumber']).toBe('1001');
    expect(rows[0]['paymentStatus']).toBe('Paid');
    expect(rows[0]['status']).toBe('Processing');
  });

  it('navigates to order details on show action', () => {
    (component as any).onShowOrder({ id: 'order-1' });
    expect(mockRouter.navigate).toHaveBeenCalledWith([
      '/admin/shop',
      'shop-1',
      'orders',
      'order-1',
    ]);
  });

  it('deletes selected order from modal confirm', async () => {
    (component as any).selectedOrder.set({
      id: 'order-1',
      shopId: 'shop-1',
      orderNumber: '1001',
      totalAmount: '230.50',
      paymentStatus: 'Paid',
      status: 'Processing',
      createdAt: '2026-08-10T11:12:13.000Z',
    });

    (component as any).onConfirmDelete();
    await fixture.whenStable();

    expect(mockOrdersService.deleteOrder).toHaveBeenCalledWith('order-1');
  });

  it('changes page and requests next result set', async () => {
    (component as any).onPageChange(2);
    await flush();

    expect(mockOrdersService.getOrders).toHaveBeenLastCalledWith({
      page: 2,
      limit: 20,
      shopId: 'shop-1',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('applies order number filter and requests filtered list', async () => {
    (component as any).orderNumberInput.set('1001');
    (component as any).onApplyFilters();
    await flush();

    expect(mockOrdersService.getOrders).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      orderNumber: '1001',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  });

  it('changes sorting to older date first', async () => {
    (component as any).onSortSelected({ label: 'old', value: 'older' });
    await flush();

    expect(mockOrdersService.getOrders).toHaveBeenLastCalledWith({
      page: 1,
      limit: 20,
      shopId: 'shop-1',
      sortBy: 'createdAt',
      sortOrder: 'asc',
    });
  });
});
