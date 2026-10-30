import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { injectQueryClient } from '@tanstack/angular-query-experimental';
import { Observable, catchError, defer, finalize, lastValueFrom, of, shareReplay, tap } from 'rxjs';
import { AUTH_API_ENDPOINTS } from '@core/constants/api.constant';
import { APP_ROUTES } from '@core/constants/routes.constants';
import { logDebug } from '@core/helpers/debug-log/debug-log.helper';
import { AuthResponse, AuthUser } from '@core/models/auth.model';
import { AuthBroadcastMessage } from '@core/models/auth-broadcast.model';
import { AUTH_BROADCAST_EVENTS } from '@core/models/auth-broadcast.enum';
import { AUTH_ROLES } from '@core/models/auth-role.enum';
import { LocalStorageService } from '../local-storage/local-storage.service';
import {
  AUTH_BROADCAST_CHANNEL,
  AUTH_LOG_MESSAGES,
  AUTH_LOG_SCOPE,
  AUTH_REFRESH_LOCK,
  AUTH_STORAGE_KEYS,
  LEGACY_ACCESS_TOKEN_KEY,
  SESSION_HINT_KEY,
} from '../../constants/auth.constant';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly localStorageService = inject(LocalStorageService);
  private readonly queryClient = injectQueryClient();
  private readonly channel = this.createChannel();
  private refreshInFlight: Observable<AuthResponse> | null = null;
  private sessionVersion = 0;

  /** Kept in memory only, so page scripts never find the token in storage. */
  private readonly session = signal<AuthResponse | null>(null);

  public readonly currentUser = computed<AuthUser | null>(() => this.session()?.user ?? null);
  public readonly isAuthenticated = computed(() => !!this.session()?.accessToken);
  public readonly isSuperAdmin = computed(() => this.currentUser()?.role === AUTH_ROLES.SUPER);

  constructor() {
    this.localStorageService.removeItem(LEGACY_ACCESS_TOKEN_KEY);
    this.channel?.addEventListener('message', this.handleBroadcast);
    inject(DestroyRef).onDestroy(() => this.channel?.close());
  }

  getAccessToken(): string | null {
    return this.session()?.accessToken ?? null;
  }

  getUserId(): string | null {
    return this.currentUser()?.id ?? null;
  }

  handleAuthSuccess(session: AuthResponse): void {
    this.session.set(session);
    this.localStorageService.setItem(SESSION_HINT_KEY, true);
    this.broadcast({ type: AUTH_BROADCAST_EVENTS.SESSION, session });
  }

  hasSessionHint(): boolean {
    return this.localStorageService.getItem<boolean>(SESSION_HINT_KEY) === true;
  }

  /** Ends the session in this tab and every other open tab. */
  clearSession(): void {
    this.resetSession();
    this.broadcast({ type: AUTH_BROADCAST_EVENTS.LOGOUT });
  }

  refreshToken(): Observable<AuthResponse> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    const refreshVersion = this.sessionVersion;
    const tokenBeforeRefresh = this.getAccessToken();
    this.logAuthDebug(AUTH_LOG_MESSAGES.REFRESH_STARTED);

    this.refreshInFlight = this.withRefreshLock(this.requestRefresh(tokenBeforeRefresh)).pipe(
      tap((session) => {
        if (this.sessionVersion !== refreshVersion) {
          this.logAuthDebug(AUTH_LOG_MESSAGES.REFRESH_STALE_IGNORED);
          return;
        }

        if (session?.accessToken) {
          this.handleAuthSuccess(session);
          this.logAuthDebug(AUTH_LOG_MESSAGES.REFRESH_SUCCEEDED);
        }
      }),
      finalize(() => {
        this.refreshInFlight = null;
        this.logAuthDebug(AUTH_LOG_MESSAGES.REFRESH_FINALIZED);
      }),
      shareReplay(1),
    );

    return this.refreshInFlight;
  }

  logout(): void {
    this.clearSession();
    this.http
      .post(AUTH_API_ENDPOINTS.LOGOUT, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe();
    this.router.navigate([APP_ROUTES.LOGIN]);
  }

  /**
   * Reuses a session another tab obtained while this one waited for the lock;
   * otherwise refreshes, presenting the cookie that tab may have just rotated.
   */
  private requestRefresh(tokenBeforeRefresh: string | null): Observable<AuthResponse> {
    return defer(() => {
      const current = this.session();
      if (current && current.accessToken !== tokenBeforeRefresh) {
        this.logAuthDebug(AUTH_LOG_MESSAGES.SESSION_REUSED_FROM_TAB);
        return of(current);
      }

      return this.http.post<AuthResponse>(
        AUTH_API_ENDPOINTS.REFRESH,
        {},
        { withCredentials: true },
      );
    });
  }

  private withRefreshLock(refresh: Observable<AuthResponse>): Observable<AuthResponse> {
    const locks = this.getLockManager();
    if (!locks) {
      return refresh;
    }

    return defer(() => locks.request(AUTH_REFRESH_LOCK, () => lastValueFrom(refresh)));
  }

  private getLockManager(): LockManager | null {
    if (!isPlatformBrowser(this.platformId) || !('locks' in navigator)) {
      return null;
    }

    return navigator.locks;
  }

  private resetSession(): void {
    this.sessionVersion += 1;
    this.session.set(null);
    for (const key of AUTH_STORAGE_KEYS) {
      this.localStorageService.removeItem(key);
    }
    this.queryClient.clear();
  }

  private createChannel(): BroadcastChannel | null {
    if (!isPlatformBrowser(this.platformId) || typeof BroadcastChannel === 'undefined') {
      return null;
    }

    return new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  }

  private broadcast(message: AuthBroadcastMessage): void {
    this.channel?.postMessage(message);
  }

  private readonly handleBroadcast = (event: MessageEvent<AuthBroadcastMessage>): void => {
    const message = event.data;

    if (message?.type === AUTH_BROADCAST_EVENTS.SESSION) {
      this.session.set(message.session);
      this.logAuthDebug(AUTH_LOG_MESSAGES.SESSION_SYNCED_FROM_TAB);
      return;
    }

    if (message?.type === AUTH_BROADCAST_EVENTS.LOGOUT) {
      this.resetSession();
      this.router.navigate([APP_ROUTES.LOGIN]);
      this.logAuthDebug(AUTH_LOG_MESSAGES.LOGGED_OUT_FROM_TAB);
    }
  };

  private logAuthDebug(message: string): void {
    logDebug(AUTH_LOG_SCOPE, message);
  }
}
