import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import {
  QUICK_ORDER_STATUS_SUCCESS_TITLES,
  QUICK_ORDERS_TEXTS,
} from './constants/quick-orders.constants';
import { QuickOrderStatus } from './models/quick-order-status.enum';
import { QuickOrderListQueryParams, QuickOrderListResponse } from './models/quick-order.model';
import { QuickOrders } from './quick-orders';
import { QuickOrdersService } from './services/quick-orders/quick-orders.service';

const TOTALS: Record<string, number> = { new: 3, processed: 2, cancelled: 1, all: 6 };

const buildResponse = (query: QuickOrderListQueryParams): QuickOrderListResponse => ({
  items:
    query.limit === 1
      ? []
      : [
          {
            id: 'q-1',
            productId: 'p-1',
            name: 'Олена Коваль',
            phone: '+380671234567',
            status: QuickOrderStatus.New,
            createdAt: '2026-11-17T07:02:00.000Z',
            product: { id: 'p-1', name: 'Iphone 14 pro max' },
          },
        ],
  total: query.limit === 1 ? TOTALS[query.status ?? 'all'] : 25,
  page: query.page,
  limit: query.limit,
  totalPages: query.limit === 1 ? 1 : 2,
});

describe('QuickOrders', () => {
  let fixture: ComponentFixture<QuickOrders>;
  let component: QuickOrders;
  let element: HTMLElement;
  let paramMap$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let mockService: {
    getQuickOrders: ReturnType<typeof vi.fn>;
    updateQuickOrder: ReturnType<typeof vi.fn>;
  };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };
  let mockToaster: { success: ReturnType<typeof vi.fn> };

  const listCalls = (): QuickOrderListQueryParams[] =>
    mockService.getQuickOrders.mock.calls
      .map(([query]) => query as QuickOrderListQueryParams)
      .filter((query) => query.limit !== 1);

  const setup = async (shopId: string | null = 'shop-1') => {
    const params = shopId ? { shopId } : {};
    paramMap$ = new BehaviorSubject(convertToParamMap(params));

    await TestBed.configureTestingModule({
      imports: [QuickOrders],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: QuickOrdersService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: ToasterService, useValue: mockToaster },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(params) },
            paramMap: paramMap$.asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickOrders);
    component = fixture.componentInstance;
    await flushQueries(fixture);
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    mockService = {
      getQuickOrders: vi.fn((query: QuickOrderListQueryParams) => of(buildResponse(query))),
      updateQuickOrder: vi.fn().mockReturnValue(of({ id: 'q-1' })),
    };
    mockRouter = { navigate: vi.fn() };
    mockToaster = { success: vi.fn() };
  });

  describe('with shop id', () => {
    beforeEach(async () => {
      await setup();
    });

    it('renders title and breadcrumbs', () => {
      expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
      expect(element.textContent).toContain(QUICK_ORDERS_TEXTS.PAGE_TITLE);
      expect(element.textContent).not.toContain(QUICK_ORDERS_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
    });

    it('requests new orders by default', () => {
      expect(listCalls()[0]).toEqual({
        page: 1,
        limit: 20,
        shopId: 'shop-1',
        status: QuickOrderStatus.New,
      });
    });

    it('requests counts for every tab and renders them', () => {
      const countCalls = mockService.getQuickOrders.mock.calls.filter(
        ([query]) => (query as QuickOrderListQueryParams).limit === 1,
      );
      expect(countCalls).toHaveLength(4);

      const tabs = Array.from(element.querySelectorAll('.quick-orders-tab')).map((tab) =>
        tab.textContent?.replace(/\s+/g, ' ').trim(),
      );
      expect(tabs).toEqual(['Нові 3', 'Оброблені 2', 'Скасовані 1', 'Усі 6']);
    });

    it('renders mapped rows', () => {
      expect(element.textContent).toContain('Олена Коваль');
      expect(element.textContent).toContain('+380 67 123 45 67');
    });

    it('switches tab, resets page and drops the status filter for all', async () => {
      (component as any).onPageChange(2);
      await flushQueries(fixture);
      (component as any).onTabSelect('all');
      await flushQueries(fixture);

      expect(listCalls().at(-1)).toEqual({ page: 1, limit: 20, shopId: 'shop-1' });
    });

    it('ignores page changes outside the range', async () => {
      const callCount = listCalls().length;
      (component as any).onPageChange(5);
      (component as any).onPageChange(1);
      await flushQueries(fixture);

      expect(listCalls()).toHaveLength(callCount);
    });

    it('applies a normalized phone search and resets it', async () => {
      (component as any).searchInput.set(' 067 123 45 67 ');
      (component as any).onApplyFilters();
      await flushQueries(fixture);

      expect(listCalls().at(-1)).toEqual(expect.objectContaining({ search: '0671234567' }));

      const callCount = listCalls().length;
      (component as any).onApplyFilters();
      await flushQueries(fixture);
      expect(listCalls()).toHaveLength(callCount);

      (component as any).onResetFilters();
      await flushQueries(fixture);
      expect(listCalls().at(-1)).not.toHaveProperty('search');
      expect((component as any).searchInput()).toBe('');
    });

    it('reset without an active filter only clears the input', async () => {
      const callCount = listCalls().length;
      (component as any).searchInput.set('Олена');
      (component as any).onResetFilters();
      await flushQueries(fixture);

      expect((component as any).searchInput()).toBe('');
      expect(listCalls()).toHaveLength(callCount);
    });

    it('updates status, shows toast and removes the row from the new tab', async () => {
      (component as any).onStatusChange({ id: 'q-1', status: QuickOrderStatus.Processed });
      await flushQueries(fixture);

      expect(mockService.updateQuickOrder).toHaveBeenCalledWith('q-1', {
        status: QuickOrderStatus.Processed,
      });
      expect(mockToaster.success).toHaveBeenCalledWith(
        QUICK_ORDER_STATUS_SUCCESS_TITLES[QuickOrderStatus.Processed],
      );
    });

    it('does not show a success toast when the update fails', async () => {
      mockService.updateQuickOrder.mockReturnValue(throwError(() => new Error('fail')));
      (component as any).onStatusChange({ id: 'q-1', status: QuickOrderStatus.Cancelled });
      await flushQueries(fixture);

      expect(mockToaster.success).not.toHaveBeenCalled();
    });

    it('navigates to the product editor', () => {
      (component as any).onOpenProduct('p-1');

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        '/admin/shop',
        'shop-1',
        'products',
        'p-1',
        'update',
      ]);
    });

    it('shows load error message', async () => {
      mockService.getQuickOrders.mockReturnValue(throwError(() => new Error('fail')));
      (component as any).onTabSelect(QuickOrderStatus.Cancelled);
      await flushQueries(fixture);

      expect(element.textContent).toContain(QUICK_ORDERS_TEXTS.LOAD_ERROR_MESSAGE);
    });
  });

  describe('without shop id', () => {
    beforeEach(async () => {
      await setup(null);
    });

    it('shows the warning and does not request data', () => {
      expect(element.textContent).toContain(QUICK_ORDERS_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
      expect(mockService.getQuickOrders).not.toHaveBeenCalled();
    });

    it('ignores status changes and product navigation', () => {
      (component as any).onStatusChange({ id: 'q-1', status: QuickOrderStatus.Processed });
      (component as any).onOpenProduct('p-1');

      expect(mockService.updateQuickOrder).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
