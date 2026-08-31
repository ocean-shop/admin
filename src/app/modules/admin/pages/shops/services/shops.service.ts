import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { ShopApiItem, ShopsApiResponse, ShopsQueryParams } from '../models/shop.model';
import { ShopCreatePayload, ShopUpdatePayload } from '../models/shop-payload.model';

@Injectable({
  providedIn: 'root',
})
export class ShopsService {
  private readonly http = inject(HttpClient);

  getShops(query: ShopsQueryParams): Observable<ShopsApiResponse | ShopApiItem[]> {
    return this.http.get<ShopsApiResponse | ShopApiItem[]>(`${API_URL}/catalog/shops`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
      },
    });
  }

  createShop(payload: ShopCreatePayload): Observable<ShopApiItem> {
    return this.http.post<ShopApiItem>(`${API_URL}/catalog/shops`, payload, {
      withCredentials: true,
    });
  }

  updateShop(id: string, payload: ShopUpdatePayload): Observable<ShopApiItem> {
    return this.http.patch<ShopApiItem>(`${API_URL}/catalog/shops/${id}`, payload, {
      withCredentials: true,
    });
  }

  deleteShop(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/catalog/shops/${id}`, {
      withCredentials: true,
    });
  }
}
