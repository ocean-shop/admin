import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { LoaderService } from '../../services/loader/loader.service';
import { loaderInterceptor } from './loader.interceptor';

describe('loaderInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let loaderService: LoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([loaderInterceptor])),
        provideHttpClientTesting(),
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    loaderService = TestBed.inject(LoaderService);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('shows loader while request is pending and hides it on success', () => {
    http.get('/api/test').subscribe();

    expect(loaderService.isLoading()).toBe(true);

    httpMock.expectOne('/api/test').flush({});

    expect(loaderService.isLoading()).toBe(false);
  });

  it('hides loader when request fails', () => {
    http.get('/api/test').subscribe({ error: () => undefined });

    httpMock.expectOne('/api/test').flush({}, { status: 500, statusText: 'Server Error' });

    expect(loaderService.isLoading()).toBe(false);
  });

  it('keeps loader visible until all parallel requests complete', () => {
    http.get('/api/first').subscribe();
    http.get('/api/second').subscribe();

    httpMock.expectOne('/api/first').flush({});
    expect(loaderService.isLoading()).toBe(true);

    httpMock.expectOne('/api/second').flush({});
    expect(loaderService.isLoading()).toBe(false);
  });
});
