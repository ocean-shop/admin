import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, Subscription, throwError } from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import {
  NOTIFICATION_SSE_ACCEPT,
  NOTIFICATION_STREAM_RETRY_BASE_MS,
  NOTIFICATIONS_API_ENDPOINTS,
} from '../../constants/notifications.constants';
import { NotificationApiItem } from '../../models/notification-api.model';
import { NotificationStreamService } from './notification-stream.service';

const encoder = new TextEncoder();

/** A fetch Response whose body emits the given SSE chunks and then closes (or stays open). */
const streamResponse = (chunks: string[], keepOpen = false): Response =>
  new Response(
    new ReadableStream<Uint8Array>({
      start(controller) {
        chunks.forEach((chunk) => controller.enqueue(encoder.encode(chunk)));
        if (!keepOpen) {
          controller.close();
        }
      },
    }),
    { status: 200 },
  );

const notificationEvent = (id: string): string =>
  `event: notification\ndata: ${JSON.stringify({ id, shopId: 's1' })}\n\n`;

const flush = async (): Promise<void> => {
  for (let i = 0; i < 5; i++) {
    await Promise.resolve();
  }
};

describe('NotificationStreamService', () => {
  let service: NotificationStreamService;
  let fetchMock: ReturnType<typeof vi.fn>;
  let authService: {
    getAccessToken: ReturnType<typeof vi.fn>;
    refreshToken: ReturnType<typeof vi.fn>;
  };
  let subscription: Subscription | undefined;
  let received: NotificationApiItem[];

  const connect = (): void => {
    subscription = service.connect('s1').subscribe((item) => received.push(item));
  };

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    authService = {
      getAccessToken: vi.fn().mockReturnValue('token'),
      refreshToken: vi.fn().mockReturnValue(of({ accessToken: 'new' })),
    };
    received = [];

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authService },
      ],
    });
    service = TestBed.inject(NotificationStreamService);
  });

  afterEach(() => {
    subscription?.unsubscribe();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('opens the stream with the bearer token and emits notifications', async () => {
    fetchMock.mockResolvedValue(
      streamResponse(
        [': hi\n\n', notificationEvent('n1').slice(0, 10), notificationEvent('n1').slice(10)],
        true,
      ),
    );

    connect();
    await vi.advanceTimersByTimeAsync(0);

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${NOTIFICATIONS_API_ENDPOINTS.STREAM}?shopId=s1`);
    expect(init.headers).toEqual({
      Authorization: 'Bearer token',
      Accept: NOTIFICATION_SSE_ACCEPT,
    });
    expect(received.map((item) => item.id)).toEqual(['n1']);
  });

  it('reconnects with backoff after the server closes the stream', async () => {
    fetchMock
      .mockResolvedValueOnce(streamResponse([]))
      .mockResolvedValueOnce(streamResponse([notificationEvent('n2')], true));

    connect();
    await vi.advanceTimersByTimeAsync(0);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(NOTIFICATION_STREAM_RETRY_BASE_MS);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(received.map((item) => item.id)).toEqual(['n2']);
  });

  it('reconnects after a network error', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(streamResponse([], true));

    connect();
    await vi.advanceTimersByTimeAsync(NOTIFICATION_STREAM_RETRY_BASE_MS);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('refreshes the session on 401 before reconnecting', async () => {
    fetchMock
      .mockResolvedValueOnce(new Response(null, { status: 401 }))
      .mockResolvedValueOnce(streamResponse([], true));

    connect();
    await vi.advanceTimersByTimeAsync(NOTIFICATION_STREAM_RETRY_BASE_MS);

    expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('treats a missing token as 401 without calling fetch', async () => {
    authService.getAccessToken.mockReturnValueOnce(null).mockReturnValue('token');
    fetchMock.mockResolvedValue(streamResponse([], true));

    connect();
    await vi.advanceTimersByTimeAsync(NOTIFICATION_STREAM_RETRY_BASE_MS);

    expect(authService.refreshToken).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('completes silently when the refresh fails', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 401 }));
    authService.refreshToken.mockReturnValue(throwError(() => new Error('expired')));
    const complete = vi.fn();
    const error = vi.fn();

    subscription = service.connect('s1').subscribe({ complete, error });
    await vi.advanceTimersByTimeAsync(0);

    expect(complete).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('stops on 403 without retrying', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 403 }));
    const complete = vi.fn();

    subscription = service.connect('s1').subscribe({ complete });
    await vi.advanceTimersByTimeAsync(NOTIFICATION_STREAM_RETRY_BASE_MS * 10);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(complete).toHaveBeenCalled();
  });

  it('aborts the request on unsubscribe and does not reconnect', async () => {
    fetchMock.mockImplementation(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) =>
          init.signal?.addEventListener('abort', () => reject(new DOMException('aborted'))),
        ),
    );

    connect();
    const signal = (fetchMock.mock.calls[0][1] as RequestInit).signal;
    subscription?.unsubscribe();
    await flush();
    await vi.advanceTimersByTimeAsync(NOTIFICATION_STREAM_RETRY_BASE_MS * 10);

    expect(signal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
