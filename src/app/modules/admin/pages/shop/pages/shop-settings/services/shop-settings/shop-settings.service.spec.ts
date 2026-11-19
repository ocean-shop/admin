import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { ShopSettingsService } from './shop-settings.service';

describe('ShopSettingsService', () => {
  let service: ShopSettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ShopSettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets the shop settings', () => {
    let result: unknown;
    service.getShopSettings('shop-1').subscribe((response) => (result = response));

    const req = httpMock.expectOne(`${API_URL}/settings/shops/shop-1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ shopId: 'shop-1', useUkrposhta: true });

    expect(result).toEqual({ shopId: 'shop-1', useUkrposhta: true });
  });

  it('patches the shop settings with the partial payload', () => {
    const payload = { usePhoneLogin: true, colorScheme: { accent: '#123456', muted: null } };
    service.updateShopSettings('shop-1', payload).subscribe();

    const req = httpMock.expectOne(`${API_URL}/settings/shops/shop-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ shopId: 'shop-1' });
  });
});
