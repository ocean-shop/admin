import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SKIP_GLOBAL_LOADER } from '@core/constants/loader.constants';
import { NOTIFICATIONS_API_ENDPOINTS } from '../../constants/notifications.constants';
import { NotificationsService } from './notifications.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(NotificationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads a page of notifications in the background', () => {
    const response = { items: [], total: 0, page: 1, limit: 20, totalPages: 0 };
    let result: unknown;

    service
      .getNotifications({ shopId: 's1', page: 1, limit: 20, unreadOnly: true })
      .subscribe((value) => (result = value));

    const req = httpMock.expectOne((request) => request.url === NOTIFICATIONS_API_ENDPOINTS.LIST);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('shopId')).toBe('s1');
    expect(req.request.params.get('page')).toBe('1');
    expect(req.request.params.get('limit')).toBe('20');
    expect(req.request.params.get('unreadOnly')).toBe('true');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    req.flush(response);

    expect(result).toEqual(response);
  });

  it('loads the unread count of a shop', () => {
    let result: unknown;
    service.getUnreadCount('s1').subscribe((value) => (result = value));

    const req = httpMock.expectOne(
      (request) => request.url === NOTIFICATIONS_API_ENDPOINTS.UNREAD_COUNT,
    );
    expect(req.request.params.get('shopId')).toBe('s1');
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    req.flush({ count: 3 });

    expect(result).toEqual({ count: 3 });
  });

  it('marks one notification as read', () => {
    service.markAsRead('n1').subscribe();

    const req = httpMock.expectOne(NOTIFICATIONS_API_ENDPOINTS.read('n1'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({});
    expect(req.request.withCredentials).toBe(true);
    expect(req.request.context.get(SKIP_GLOBAL_LOADER)).toBe(true);
    req.flush({});
  });

  it('marks every notification of a shop as read', () => {
    service.markAllAsRead('s1').subscribe();

    const req = httpMock.expectOne(NOTIFICATIONS_API_ENDPOINTS.READ_ALL);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ shopId: 's1' });
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });
});
