import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_URL } from '@core/constants/api.constant';
import { AdminCreatePayload, AdminUpdatePayload } from '../models/admin-payload.model';
import { AdminsService } from './admins.service';

describe('AdminsService', () => {
  let service: AdminsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AdminsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests admins list with pagination params', () => {
    service.getAdmins({ page: 2, limit: 15 }).subscribe();

    const req = httpMock.expectOne((request) => {
      return (
        request.url === `${API_URL}/user/admins` &&
        request.params.get('page') === '2' &&
        request.params.get('limit') === '15'
      );
    });
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ items: [], total: 0, page: 2, limit: 15, totalPages: 1 });
  });

  it('requests admin by id', () => {
    service.getAdminById('admin-1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/admins/admin-1`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBe(true);
    req.flush({ id: 'admin-1' });
  });

  it('creates admin with payload', () => {
    const payload: AdminCreatePayload = {
      email: 'admin@ocean.dev',
      role: 'admin',
      shopIds: ['shop-1'],
    };

    service.createAdmin(payload).subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/admins/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'admin-1' });
  });

  it('updates admin with payload', () => {
    const payload: AdminUpdatePayload = { role: 'super', shopIds: ['shop-2'] };

    service.updateAdmin('admin-1', payload).subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/admins/admin-1`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.body).toEqual(payload);
    req.flush({ id: 'admin-1' });
  });

  it('deletes admin by id', () => {
    service.deleteAdmin('admin-1').subscribe();

    const req = httpMock.expectOne(`${API_URL}/user/admins/admin-1`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
