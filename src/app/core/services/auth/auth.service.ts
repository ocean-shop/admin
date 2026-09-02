import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, isDevMode, signal } from '@angular/core';
import { Observable, catchError, finalize, of, shareReplay, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { API_URL } from '@core/constants/api.constant';
import { RefreshResponse } from '@core/models/auth.model';
import { LocalStorageService } from '../local-storage/local-storage.service';
import {
  ACCESS_TOKEN_KEY,
  AUTH_STORAGE_KEYS,
  SESSION_HINT_KEY,
} from '../../constants/auth.constant';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);
  private localStorageService = inject(LocalStorageService);
  private refreshInFlight: Observable<RefreshResponse> | null = null;
  private sessionVersion = 0;

  private accessTokenSignal = signal<string | null>(this.getStoredAccessToken());

  public isAuthenticated = computed(() => !!this.accessTokenSignal());

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('storage', this.handleStorageEvent);
    }
  }

  setAccessToken(token: string): void {
    this.accessTokenSignal.set(token);
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  getUserId(): string | null {
    const token = this.accessTokenSignal();
    if (!token) {
      return null;
    }

    try {
      const decoded = jwtDecode<{ sub?: string; userId?: string; id?: string }>(token);
      return decoded.sub ?? decoded.userId ?? decoded.id ?? null;
    } catch {
      return null;
    }
  }

  handleAuthSuccess(token: string): void {
    this.setAccessToken(token);
    this.localStorageService.setItem(ACCESS_TOKEN_KEY, token);
    this.localStorageService.setItem(SESSION_HINT_KEY, true);
  }

  hasSessionHint(): boolean {
    return this.localStorageService.getItem<boolean>(SESSION_HINT_KEY) === true;
  }

  clearSession(): void {
    this.sessionVersion += 1;
    this.accessTokenSignal.set(null);
    for (const key of AUTH_STORAGE_KEYS) {
      this.localStorageService.removeItem(key);
    }
  }

  private getStoredAccessToken(): string | null {
    return this.localStorageService.getItem<string>(ACCESS_TOKEN_KEY);
  }

  refreshToken(): Observable<RefreshResponse> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    const refreshVersion = this.sessionVersion;
    this.logAuthDebug('Starting refresh request');

    this.refreshInFlight = this.http
      .post<RefreshResponse>(`${API_URL}/user/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (this.sessionVersion !== refreshVersion) {
            this.logAuthDebug('Ignoring stale refresh response');
            return;
          }

          if (response && response.accessToken) {
            this.handleAuthSuccess(response.accessToken);
            this.logAuthDebug('Refresh succeeded and token updated');
          }
        }),
        finalize(() => {
          this.refreshInFlight = null;
          this.logAuthDebug('Refresh request finalized');
        }),
        shareReplay(1),
      );

    return this.refreshInFlight;
  }

  logout(): void {
    this.clearSession();
    this.http
      .post(`${API_URL}/user/auth/logout`, {}, { withCredentials: true })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  private handleStorageEvent = (event: StorageEvent): void => {
    if (event.key !== ACCESS_TOKEN_KEY) {
      return;
    }

    const nextToken = this.parseStorageToken(event.newValue);
    this.accessTokenSignal.set(nextToken);
    this.logAuthDebug('Synced access token from another tab');
  };

  private parseStorageToken(value: string | null): string | null {
    if (!value) {
      return null;
    }

    try {
      const parsed = JSON.parse(value);
      return typeof parsed === 'string' ? parsed : null;
    } catch {
      return null;
    }
  }

  private logAuthDebug(message: string): void {
    if (!isDevMode()) {
      return;
    }

    console.debug(`[AuthService] ${message}`);
  }
}
