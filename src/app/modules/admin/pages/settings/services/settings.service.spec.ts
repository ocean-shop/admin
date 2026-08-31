import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { SettingsService } from './settings.service';

describe('SettingsService', () => {
  let service: SettingsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(SettingsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('gets user settings by user id', () => {
    service.getUserSettings('user-123').subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/settings/user-123`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ language: 'en' });
  });

  it('handles null user id in request path', () => {
    service.getUserSettings(null).subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/settings/null`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ language: 'en' });
  });

  it('sets user settings with payload', () => {
    const payload = { language: 'ua', userId: 'user-123' };
    service.setUserSettings(payload).subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/settings`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ language: 'ua' });
  });
});
