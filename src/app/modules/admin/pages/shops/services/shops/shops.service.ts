import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { PaginationQuery } from '@core/models/pagination-query.model';
import { extractShopItems } from '../../helpers/shop-mapping/shop-mapping.helper';
import { ShopApiItem, ShopsApiResponse } from '../../models/shop.model';
import { ShopCreatePayload, ShopUpdatePayload } from '../../models/shop-payload.model';

@Injectable({
  providedIn: 'root',
})
export class ShopsService {
  private readonly http = inject(HttpClient);

  getShops(query: PaginationQuery): Observable<ShopsApiResponse | ShopApiItem[]> {
    return this.http.get<ShopsApiResponse | ShopApiItem[]>(`${API_URL}/catalog/shops`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
      },
    });
  }

  /** Loads the first page, then every remaining page in parallel. */
  getAllShops(limit: number): Observable<ShopApiItem[]> {
    return this.getShops({ page: 1, limit }).pipe(
      switchMap((firstPage) => {
        const totalPages = Array.isArray(firstPage) ? 1 : Math.max(1, firstPage.totalPages ?? 1);
        const nextPages = Array.from({ length: totalPages - 1 }, (_, index) =>
          this.getShops({ page: index + 2, limit }),
        );
        return nextPages.length ? forkJoin([of(firstPage), ...nextPages]) : of([firstPage]);
      }),
      map((pages) => pages.flatMap(extractShopItems)),
    );
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
