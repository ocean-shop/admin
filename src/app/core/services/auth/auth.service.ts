import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, finalize, shareReplay, tap } from 'rxjs';
import { LocalStorageService } from '../local-storage/local-storage.service';
import { SESSION_HINT_KEY } from '../../constants/auth.constant';

interface RefreshResponse {
  accessToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private localStorageService = inject(LocalStorageService);
  private readonly API_URL = 'http://localhost:3000';

  private accessTokenSignal = signal<string | null>(null);
  private refreshInFlight: Observable<RefreshResponse> | null = null;

  public isAuthenticated = computed(() => !!this.accessTokenSignal());

  setAccessToken(token: string): void {
    this.accessTokenSignal.set(token);
  }

  getAccessToken(): string | null {
    return this.accessTokenSignal();
  }

  handleAuthSuccess(token: string): void {
    this.setAccessToken(token);
    this.localStorageService.setItem(SESSION_HINT_KEY, true);
  }

  hasSessionHint(): boolean {
    return this.localStorageService.getItem<boolean>(SESSION_HINT_KEY) === true;
  }

  clearSession(): void {
    this.accessTokenSignal.set(null);
    this.localStorageService.removeItem(SESSION_HINT_KEY);
  }

  refreshToken(): Observable<RefreshResponse> {
    if (this.refreshInFlight) {
      return this.refreshInFlight;
    }

    this.refreshInFlight = this.http
      .post<RefreshResponse>(`${this.API_URL}/user/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          if (response && response.accessToken) {
            this.handleAuthSuccess(response.accessToken);
          }
        }),
        finalize(() => {
          this.refreshInFlight = null;
        }),
        shareReplay(1),
      );

    return this.refreshInFlight;
  }

  logout(): void {
    this.clearSession();
    this.http.post(`${this.API_URL}/user/auth/logout`, {}, { withCredentials: true }).subscribe();
  }
}
