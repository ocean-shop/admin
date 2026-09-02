import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { ShopStatistic } from '../models/shop-statistic.model';

@Injectable({
  providedIn: 'root',
})
export class ShopStatisticService {
  private readonly http = inject(HttpClient);

  getStatistic(shopId: string): Observable<ShopStatistic> {
    return this.http.get<ShopStatistic>(`${API_URL}/statistic/shop`, {
      withCredentials: true,
      params: { shopId },
    });
  }
}
