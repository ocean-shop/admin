import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import {
  ShopSettingsApiResponse,
  ShopSettingsUpdatePayload,
} from '../../models/shop-settings-api.model';

@Injectable({
  providedIn: 'root',
})
export class ShopSettingsService {
  private readonly http = inject(HttpClient);

  getShopSettings(shopId: string): Observable<ShopSettingsApiResponse> {
    return this.http.get<ShopSettingsApiResponse>(`${API_URL}/settings/shops/${shopId}`, {
      withCredentials: true,
    });
  }

  updateShopSettings(
    shopId: string,
    payload: ShopSettingsUpdatePayload,
  ): Observable<ShopSettingsApiResponse> {
    return this.http.patch<ShopSettingsApiResponse>(
      `${API_URL}/settings/shops/${shopId}`,
      payload,
      { withCredentials: true },
    );
  }
}
