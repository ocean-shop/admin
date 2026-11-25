import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { ReviewStatus } from '../../models/review-status.enum';
import { ReviewsService } from './reviews.service';

describe('ReviewsService', () => {
  let service: ReviewsService;
  let httpMock: HttpTestingController;
  const url = `${API_URL}/catalog/product-reviews`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ReviewsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the list with required params only', () => {
    service.getReviews({ page: 2, limit: 20, shopId: 'shop-1' }).subscribe();

    const req = httpMock.expectOne((request) => request.url === url);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('shopId')).toBe('shop-1');
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.has('rating')).toBe(false);
    expect(req.request.params.has('sortOrder')).toBe(false);
    req.flush({ items: [], total: 0, page: 2, limit: 20, totalPages: 0 });
  });

  it('adds status, rating and sort order when given', () => {
    service
      .getReviews({
        page: 1,
        limit: 20,
        shopId: 'shop-1',
        status: ReviewStatus.Approved,
        rating: 4,
        sortOrder: 'asc',
      })
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === url);
    expect(req.request.params.get('status')).toBe(ReviewStatus.Approved);
    expect(req.request.params.get('rating')).toBe('4');
    expect(req.request.params.get('sortOrder')).toBe('asc');
    req.flush({ items: [], total: 0, page: 1, limit: 20, totalPages: 0 });
  });

  it('patches the review status', () => {
    service.updateReviewStatus('r-1', { status: ReviewStatus.Rejected }).subscribe();

    const req = httpMock.expectOne(`${url}/r-1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual({ status: ReviewStatus.Rejected });
    req.flush({ id: 'r-1', status: ReviewStatus.Rejected });
  });
});
