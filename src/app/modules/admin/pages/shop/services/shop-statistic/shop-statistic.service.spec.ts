import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { ShopStatisticService } from './shop-statistic.service';

describe('ShopStatisticService', () => {
  let service: ShopStatisticService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ShopStatisticService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets shop statistic with shopId query param', () => {
    service.getStatistic('shop-42').subscribe();

    const req = httpMock.expectOne(`${API_URL}/statistic/shop?shopId=shop-42`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params.get('shopId')).toBe('shop-42');
    req.flush({ totalSales: 0 });
  });
});
