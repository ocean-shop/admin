import { HttpStatusCode } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  EMPTY,
  Observable,
  Subscriber,
  catchError,
  defer,
  retry,
  switchMap,
  throwError,
  timer,
} from 'rxjs';
import { AuthService } from '@core/services/auth/auth.service';
import {
  NOTIFICATION_SSE_ACCEPT,
  NOTIFICATION_STREAM_NETWORK_ERROR_STATUS,
  NOTIFICATION_STREAM_RETRY_BASE_MS,
  NOTIFICATION_STREAM_RETRY_MAX_MS,
  NOTIFICATIONS_API_ENDPOINTS,
} from '../../constants/notifications.constants';
import { parseNotificationEvent, splitSseBuffer } from '../../helpers/sse-parser/sse-parser.helper';
import { NotificationApiItem } from '../../models/notification-api.model';
import { NotificationStreamFailure } from '../../models/notification-stream-failure.model';

/**
 * Live notifications over Server-Sent Events. The API authenticates with a Bearer header only,
 * which `EventSource` cannot send, so the stream is read with `fetch`. A dropped connection
 * reconnects with backoff; a 401 refreshes the session first; a 403 stops the stream.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificationStreamService {
  private readonly authService = inject(AuthService);

  connect(shopId: string): Observable<NotificationApiItem> {
    return defer(() => this.open(shopId)).pipe(
      retry({
        resetOnSuccess: true,
        delay: (error: NotificationStreamFailure, attempt: number) =>
          this.retryDelay(error, attempt),
      }),
      catchError(() => EMPTY),
    );
  }

  private open(shopId: string): Observable<NotificationApiItem> {
    return new Observable<NotificationApiItem>((subscriber) => {
      const token = this.authService.getAccessToken();
      if (!token) {
        subscriber.error(this.failure(HttpStatusCode.Unauthorized));
        return;
      }

      const controller = new AbortController();
      const url = `${NOTIFICATIONS_API_ENDPOINTS.STREAM}?${new URLSearchParams({ shopId })}`;

      fetch(url, {
        headers: { Authorization: `Bearer ${token}`, Accept: NOTIFICATION_SSE_ACCEPT },
        credentials: 'include',
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok || !response.body) {
            throw this.failure(response.status);
          }

          return this.read(response.body, subscriber);
        })
        // The server closing the stream is not the end of the session: reconnect.
        .then(() => subscriber.error(this.failure(NOTIFICATION_STREAM_NETWORK_ERROR_STATUS)))
        .catch((error: unknown) => {
          if (!controller.signal.aborted) {
            subscriber.error(this.toFailure(error));
          }
        });

      return () => controller.abort();
    });
  }

  private async read(
    body: ReadableStream<Uint8Array>,
    subscriber: Subscriber<NotificationApiItem>,
  ): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    for (;;) {
      const { value, done } = await reader.read();
      if (done) {
        return;
      }

      const chunk = splitSseBuffer(buffer + decoder.decode(value, { stream: true }));
      buffer = chunk.rest;

      for (const message of chunk.messages) {
        const notification = parseNotificationEvent(message);
        if (notification) {
          subscriber.next(notification);
        }
      }
    }
  }

  private retryDelay(error: NotificationStreamFailure, attempt: number): Observable<unknown> {
    if (error.status === HttpStatusCode.Forbidden) {
      return throwError(() => error);
    }

    const delay = Math.min(
      NOTIFICATION_STREAM_RETRY_BASE_MS * 2 ** (attempt - 1),
      NOTIFICATION_STREAM_RETRY_MAX_MS,
    );

    if (error.status === HttpStatusCode.Unauthorized) {
      return this.authService.refreshToken().pipe(switchMap(() => timer(delay)));
    }

    return timer(delay);
  }

  private toFailure(error: unknown): NotificationStreamFailure {
    const status = (error as NotificationStreamFailure | null)?.status;
    return this.failure(
      typeof status === 'number' ? status : NOTIFICATION_STREAM_NETWORK_ERROR_STATUS,
    );
  }

  private failure(status: number): NotificationStreamFailure {
    return { status };
  }
}
