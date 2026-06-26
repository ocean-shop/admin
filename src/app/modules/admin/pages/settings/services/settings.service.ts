import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SettingsData, SettingsUpdateData } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  getUserSettings(userId: string | null): Observable<SettingsData> {
    return this.http.get<SettingsData>(`${this.API_URL}/user/settings/${userId}`, {
      withCredentials: true,
    });
  }

  setUserSettings(payload: SettingsUpdateData): Observable<SettingsData> {
    return this.http.post<SettingsData>(`${this.API_URL}/user/settings`, payload, {
      withCredentials: true,
    });
  }
}
