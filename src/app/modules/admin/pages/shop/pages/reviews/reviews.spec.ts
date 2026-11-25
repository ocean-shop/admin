import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { ToasterService } from '@core/services/toaster/toaster.service';
import { flushQueries } from '@testing/flush-async';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { REVIEW_STATUS_SUCCESS_TITLES, REVIEWS_TEXTS } from './constants/reviews.constants';
import { ReviewStatus } from './models/review-status.enum';
import { ReviewListQueryParams, ReviewListResponse } from './models/review.model';
import { Reviews } from './reviews';
import { ReviewsService } from './services/reviews/reviews.service';

const buildResponse = (query: ReviewListQueryParams, total = 25): ReviewListResponse => ({
  items: total
    ? [
        {
          id: 'r-1',
          productId: 'p-1',
          name: 'Олена Коваль',
          comment: 'Чудовий телефон',
          rating: 5,
          status: ReviewStatus.Approved,
          createdAt: '2026-11-23T10:00:00.000Z',
          product: { id: 'p-1', name: 'Iphone 14 pro max' },
        },
      ]
    : [],
  total,
  page: query.page,
  limit: query.limit,
  totalPages: Math.ceil(total / query.limit),
});

describe('Reviews', () => {
  let fixture: ComponentFixture<Reviews>;
  let component: Reviews;
  let element: HTMLElement;
  let mockService: {
    getReviews: ReturnType<typeof vi.fn>;
    updateReviewStatus: ReturnType<typeof vi.fn>;
  };
  let mockToaster: { success: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const calls = (): ReviewListQueryParams[] =>
    mockService.getReviews.mock.calls.map(([query]) => query as ReviewListQueryParams);

  const setup = async (shopId: string | null = 'shop-1') => {
    const params = shopId ? { shopId } : {};

    await TestBed.configureTestingModule({
      imports: [Reviews],
      providers: [
        provideZonelessChangeDetection(),
        ...provideTestQueryClient(),
        { provide: ReviewsService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
        { provide: ToasterService, useValue: mockToaster },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap(params) },
            paramMap: new BehaviorSubject(convertToParamMap(params)).asObservable(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Reviews);
    component = fixture.componentInstance;
    await flushQueries(fixture);
    element = fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    mockService = {
      getReviews: vi.fn((query: ReviewListQueryParams) => of(buildResponse(query))),
      updateReviewStatus: vi.fn().mockReturnValue(of({ id: 'r-1' })),
    };
    mockRouter = { navigate: vi.fn() };
    mockToaster = { success: vi.fn() };
  });

  describe('with shop id', () => {
    beforeEach(async () => {
      await setup();
    });

    it('renders title, breadcrumbs, count and rows', () => {
      expect(element.querySelector('nav[aria-label="Breadcrumb"]')).toBeTruthy();
      expect(element.textContent).toContain(REVIEWS_TEXTS.PAGE_TITLE);
      expect(element.textContent).toContain('25 відгуків');
      expect(element.textContent).toContain('Олена Коваль');
      expect(element.textContent).not.toContain(REVIEWS_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
    });

    it('requests the first page with default filters', () => {
      expect(calls()[0]).toEqual({ page: 1, limit: 20, shopId: 'shop-1', sortOrder: 'desc' });
    });

    it('applies draft filters only on apply and resets the page', async () => {
      (component as any).onPageChange(2);
      await flushQueries(fixture);
      expect(calls().at(-1)?.page).toBe(2);

      const callCount = calls().length;
      (component as any).onStatusSelected({ label: '', value: ReviewStatus.Pending });
      (component as any).onRatingSelected({ label: '', value: '3' });
      (component as any).onSortSelected({ label: '', value: 'asc' });
      await flushQueries(fixture);
      expect(calls()).toHaveLength(callCount);

      (component as any).onApplyFilters();
      await flushQueries(fixture);
      expect(calls().at(-1)).toEqual({
        page: 1,
        limit: 20,
        shopId: 'shop-1',
        status: ReviewStatus.Pending,
        rating: 3,
        sortOrder: 'asc',
      });
    });

    it('ignores unknown dropdown values', () => {
      (component as any).onStatusSelected({ label: '', value: 'bad' });
      (component as any).onRatingSelected({ label: '', value: '9' });
      (component as any).onSortSelected({ label: '', value: 'up' });

      expect((component as any).draftFilters()).toEqual({
        status: 'all',
        rating: 'all',
        sortOrder: 'desc',
      });
    });

    it('does not refetch when applying unchanged filters', async () => {
      const callCount = calls().length;
      (component as any).onApplyFilters();
      (component as any).onResetFilters();
      await flushQueries(fixture);

      expect(calls()).toHaveLength(callCount);
    });

    it('resets draft and applied filters', async () => {
      (component as any).onRatingSelected({ label: '', value: '5' });
      (component as any).onApplyFilters();
      await flushQueries(fixture);

      (component as any).onResetFilters();
      await flushQueries(fixture);

      expect(calls().at(-1)).toEqual({ page: 1, limit: 20, shopId: 'shop-1', sortOrder: 'desc' });
      expect((component as any).draftFilters().rating).toBe('all');
    });

    it('ignores page changes outside the range', async () => {
      const callCount = calls().length;
      (component as any).onPageChange(5);
      (component as any).onPageChange(1);
      await flushQueries(fixture);

      expect(calls()).toHaveLength(callCount);
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

    it('updates the status, patches the row and shows a toast', async () => {
      (component as any).onStatusChange({ id: 'r-1', status: ReviewStatus.Rejected });
      await flushQueries(fixture);

      expect(mockService.updateReviewStatus).toHaveBeenCalledWith('r-1', {
        status: ReviewStatus.Rejected,
      });
      expect(mockToaster.success).toHaveBeenCalledWith(
        REVIEW_STATUS_SUCCESS_TITLES[ReviewStatus.Rejected],
      );
      expect(calls().length).toBeGreaterThan(1);
    });

    it('exposes the pending status change and ignores clicks meanwhile', async () => {
      const response$ = new Subject<unknown>();
      mockService.updateReviewStatus.mockReturnValue(response$);

      (component as any).onStatusChange({ id: 'r-1', status: ReviewStatus.Rejected });
      // `flushQueries` would wait for the open mutation, so only let TanStack notify.
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect((component as any).pendingStatusChange()).toEqual({
        id: 'r-1',
        status: ReviewStatus.Rejected,
      });

      (component as any).onStatusChange({ id: 'r-1', status: ReviewStatus.Pending });
      expect(mockService.updateReviewStatus).toHaveBeenCalledTimes(1);

      response$.next({ id: 'r-1' });
      response$.complete();
      await flushQueries(fixture);
      expect((component as any).pendingStatusChange()).toBeNull();
    });

    it('does not show a success toast when the update fails', async () => {
      mockService.updateReviewStatus.mockReturnValue(throwError(() => new Error('fail')));
      (component as any).onStatusChange({ id: 'r-1', status: ReviewStatus.Pending });
      await flushQueries(fixture);

      expect(mockToaster.success).not.toHaveBeenCalled();
    });

    it('shows the empty state', async () => {
      mockService.getReviews.mockImplementation((query: ReviewListQueryParams) =>
        of(buildResponse(query, 0)),
      );
      (component as any).onRatingSelected({ label: '', value: '1' });
      (component as any).onApplyFilters();
      await flushQueries(fixture);

      expect(element.textContent).toContain(REVIEWS_TEXTS.EMPTY_TITLE);
      expect(element.textContent).toContain('0 відгуків');
    });

    it('shows load error message', async () => {
      mockService.getReviews.mockReturnValue(throwError(() => new Error('fail')));
      (component as any).onRatingSelected({ label: '', value: '2' });
      (component as any).onApplyFilters();
      await flushQueries(fixture);

      expect(element.textContent).toContain(REVIEWS_TEXTS.LOAD_ERROR_MESSAGE);
    });
  });

  describe('without shop id', () => {
    beforeEach(async () => {
      await setup(null);
    });

    it('shows the warning and does not request data', () => {
      expect(element.textContent).toContain(REVIEWS_TEXTS.SHOP_ID_REQUIRED_MESSAGE);
      expect(mockService.getReviews).not.toHaveBeenCalled();
      expect(element.textContent).not.toContain(REVIEWS_TEXTS.EMPTY_TITLE);
    });

    it('ignores status changes', () => {
      (component as any).onStatusChange({ id: 'r-1', status: ReviewStatus.Approved });

      expect(mockService.updateReviewStatus).not.toHaveBeenCalled();
    });

    it('ignores product navigation', () => {
      (component as any).onOpenProduct('p-1');

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
