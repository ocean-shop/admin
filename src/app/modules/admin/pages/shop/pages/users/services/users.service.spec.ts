import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { UsersService } from './users.service';

describe('UsersService', () => {
  const API_URL = 'https://api-production-1765.up.railway.app';
  let service: UsersService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(UsersService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests users list with query params', () => {
    service
      .getUsers({
        page: 2,
        limit: 20,
        shopId: 'shop-1',
      })
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === `${API_URL}/user/users`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('shopId')).toBe('shop-1');
    req.flush({ items: [], total: 0, page: 2, limit: 20, totalPages: 1 });
  });

  it('includes optional filter and sorting params for users list', () => {
    service
      .getUsers({
        page: 1,
        limit: 20,
        shopId: 'shop-1',
        email: 'john@example.com',
        phoneNumber: '+380991112233',
        sortOrder: 'asc',
      })
      .subscribe();

    const req = httpMock.expectOne((request) => request.url === `${API_URL}/user/users`);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('email')).toBe('john@example.com');
    expect(req.request.params.get('phoneNumber')).toBe('+380991112233');
    expect(req.request.params.get('sortOrder')).toBe('asc');
    req.flush({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 });
  });

  it('requests single user by id', () => {
    service.getUserById('user-1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/users/user-1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ id: 'user-1' });
  });
});
