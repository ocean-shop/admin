import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { SettingsData, SettingsUpdateData } from '../models/settings.model';

@Injectable({
  providedIn: 'root',
})
export class SettingsService {
  private readonly http = inject(HttpClient);

  getUserSettings(userId: string | null): Observable<SettingsData> {
    return this.http.get<SettingsData>(`${API_URL}/user/settings/${userId}`, {
      withCredentials: true,
    });
  }

  setUserSettings(payload: SettingsUpdateData): Observable<SettingsData> {
    return this.http.post<SettingsData>(`${API_URL}/user/settings`, payload, {
      withCredentials: true,
    });
  }
}
