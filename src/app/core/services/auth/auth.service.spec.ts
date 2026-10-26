import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { QueryClient } from '@tanstack/angular-query-experimental';
import { provideTestQueryClient } from '@testing/query-client-test.provider';
import { buildAuthSession } from '@testing/auth-session.fixture';
import { API_URL } from '@core/constants/api.constant';
import { AUTH_BROADCAST_EVENTS } from '@core/models/auth-broadcast.enum';
import { AUTH_ROLES } from '@core/models/auth-role.enum';
import {
  AUTH_REFRESH_LOCK,
  AUTH_STORAGE_KEYS,
  LEGACY_ACCESS_TOKEN_KEY,
  SESSION_HINT_KEY,
} from '../../constants/auth.constant';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let localStorageService: LocalStorageService;
  let queryClient: QueryClient;
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const refreshUrl = `${API_URL}/user/auth/refresh`;
  const logoutUrl = `${API_URL}/user/auth/logout`;

  const setup = (): void => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        ...provideTestQueryClient(),
        { provide: Router, useValue: mockRouter },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorageService = TestBed.inject(LocalStorageService);
    queryClient = TestBed.inject(QueryClient);
  };

  const channelOf = (target: AuthService): BroadcastChannel => (target as any).channel;

  const receive = (data: unknown): void => {
    (service as any).handleBroadcast({ data } as MessageEvent);
  };

  beforeEach(() => {
    localStorage.clear();
    mockRouter = { navigate: vi.fn() };
    setup();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    Reflect.deleteProperty(navigator, 'locks');
  });

  it('starts unauthenticated with no user', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.getAccessToken()).toBeNull();
    expect(service.getUserId()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isSuperAdmin()).toBe(false);
  });

  it('purges the legacy access token from storage on start', () => {
    TestBed.resetTestingModule();
    localStorage.setItem(LEGACY_ACCESS_TOKEN_KEY, JSON.stringify('old-token'));

    setup();

    expect(localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY)).toBeNull();
  });

  it('keeps the session in memory and stores only the session hint', () => {
    const session = buildAuthSession('token-value', { id: 'user-7' });

    service.handleAuthSuccess(session);

    expect(service.getAccessToken()).toBe('token-value');
    expect(service.isAuthenticated()).toBe(true);
    expect(service.getUserId()).toBe('user-7');
    expect(service.currentUser()).toEqual(session.user);
    expect(service.hasSessionHint()).toBe(true);
    expect(localStorageService.getItem(SESSION_HINT_KEY)).toBe(true);
    expect(localStorage.getItem(LEGACY_ACCESS_TOKEN_KEY)).toBeNull();
  });

  it('detects super admin role', () => {
    service.handleAuthSuccess(buildAuthSession('token', { role: AUTH_ROLES.SUPER }));
    expect(service.isSuperAdmin()).toBe(true);

    service.handleAuthSuccess(buildAuthSession('token', { role: AUTH_ROLES.ADMIN }));
    expect(service.isSuperAdmin()).toBe(false);
  });

  it('broadcasts a new session to other tabs', () => {
    const postSpy = vi.spyOn(channelOf(service), 'postMessage');
    const session = buildAuthSession();

    service.handleAuthSuccess(session);

    expect(postSpy).toHaveBeenCalledWith({ type: AUTH_BROADCAST_EVENTS.SESSION, session });
  });

  it('clears session, storage keys and query cache, and broadcasts logout', () => {
    const postSpy = vi.spyOn(channelOf(service), 'postMessage');
    const clearSpy = vi.spyOn(queryClient, 'clear');
    service.handleAuthSuccess(buildAuthSession());
    for (const key of AUTH_STORAGE_KEYS) {
      localStorageService.setItem(key, 'value');
    }

    service.clearSession();

    expect(service.getAccessToken()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    for (const key of AUTH_STORAGE_KEYS) {
      expect(localStorageService.getItem(key)).toBeNull();
    }
    expect(clearSpy).toHaveBeenCalled();
    expect(postSpy).toHaveBeenLastCalledWith({ type: AUTH_BROADCAST_EVENTS.LOGOUT });
  });

  it('logout clears session, POSTs to logout with credentials and navigates to login', () => {
    service.handleAuthSuccess(buildAuthSession());

    service.logout();

    expect(service.getAccessToken()).toBeNull();
    const req = httpMock.expectOne(logoutUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('does not throw when logout API call fails', () => {
    service.handleAuthSuccess(buildAuthSession());

    expect(() => {
      service.logout();
      httpMock
        .expectOne(logoutUrl)
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    }).not.toThrow();

    expect(service.getAccessToken()).toBeNull();
  });

  it('reuses in-flight refresh request and stores the refreshed session', () => {
    const session = buildAuthSession('refreshed-token');
    let firstResult: unknown;
    let secondResult: unknown;

    service.refreshToken().subscribe((result) => (firstResult = result));
    service.refreshToken().subscribe((result) => (secondResult = result));

    const req = httpMock.expectOne(refreshUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush(session);

    expect(firstResult).toEqual(session);
    expect(secondResult).toEqual(session);
    expect(service.getAccessToken()).toBe('refreshed-token');
    expect(service.currentUser()).toEqual(session.user);
    expect(service.hasSessionHint()).toBe(true);
  });

  it('does not store a refresh response without an access token', () => {
    service.refreshToken().subscribe();
    httpMock.expectOne(refreshUrl).flush({});

    expect(service.isAuthenticated()).toBe(false);
    expect(service.hasSessionHint()).toBe(false);
  });

  it('clears refresh in-flight state after a failed refresh', () => {
    service.refreshToken().subscribe({ error: () => undefined });
    httpMock.expectOne(refreshUrl).flush('failure', { status: 500, statusText: 'Server Error' });

    service.refreshToken().subscribe();
    httpMock.expectOne(refreshUrl).flush(buildAuthSession('new-token'));

    expect(service.getAccessToken()).toBe('new-token');
  });

  it('ignores refresh response when logout clears session mid-flight', () => {
    service.handleAuthSuccess(buildAuthSession('initial-token'));

    service.refreshToken().subscribe();
    const refreshReq = httpMock.expectOne(refreshUrl);

    service.logout();
    httpMock.expectOne(logoutUrl).flush({});

    refreshReq.flush(buildAuthSession('late-token'));

    expect(service.getAccessToken()).toBeNull();
    expect(service.hasSessionHint()).toBe(false);
  });

  describe('with Web Locks', () => {
    let request: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      request = vi.fn((_name: string, task: () => Promise<unknown>) => task());
      Object.defineProperty(navigator, 'locks', { value: { request }, configurable: true });
    });

    it('runs the refresh inside the cross-tab lock', async () => {
      const result = new Promise((resolve) => service.refreshToken().subscribe(resolve));

      expect(request).toHaveBeenCalledWith(AUTH_REFRESH_LOCK, expect.any(Function));
      httpMock.expectOne(refreshUrl).flush(buildAuthSession('locked-token'));

      await expect(result).resolves.toEqual(buildAuthSession('locked-token'));
      expect(service.getAccessToken()).toBe('locked-token');
    });

    it('reuses a session another tab refreshed while waiting for the lock', async () => {
      const fromOtherTab = buildAuthSession('other-tab-token');
      service.handleAuthSuccess(buildAuthSession('expired-token'));
      request.mockImplementation((_name: string, task: () => Promise<unknown>) => {
        receive({ type: AUTH_BROADCAST_EVENTS.SESSION, session: fromOtherTab });
        return task();
      });

      const result = await new Promise((resolve) => service.refreshToken().subscribe(resolve));

      httpMock.expectNone(refreshUrl);
      expect(result).toEqual(fromOtherTab);
      expect(service.getAccessToken()).toBe('other-tab-token');
    });
  });

  describe('messages from other tabs', () => {
    it('applies a session without re-broadcasting it', () => {
      const postSpy = vi.spyOn(channelOf(service), 'postMessage');
      const session = buildAuthSession('tab-token');

      receive({ type: AUTH_BROADCAST_EVENTS.SESSION, session });

      expect(service.getAccessToken()).toBe('tab-token');
      expect(postSpy).not.toHaveBeenCalled();
    });

    it('logs out and navigates to login without re-broadcasting', () => {
      const postSpy = vi.spyOn(channelOf(service), 'postMessage');
      const clearSpy = vi.spyOn(queryClient, 'clear');
      service.handleAuthSuccess(buildAuthSession());
      postSpy.mockClear();

      receive({ type: AUTH_BROADCAST_EVENTS.LOGOUT });

      expect(service.isAuthenticated()).toBe(false);
      expect(clearSpy).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(postSpy).not.toHaveBeenCalled();
      httpMock.expectNone(logoutUrl);
    });

    it('ignores unknown messages', () => {
      service.handleAuthSuccess(buildAuthSession('kept-token'));

      receive({ type: 'unknown' });
      receive(null);

      expect(service.getAccessToken()).toBe('kept-token');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
