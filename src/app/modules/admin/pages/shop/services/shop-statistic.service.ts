import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ShopStatistic } from '../models/shop-statistic.model';

@Injectable({
  providedIn: 'root',
})
export class ShopStatisticService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'https://api-production-1765.up.railway.app';

  getStatistic(shopId: string): Observable<ShopStatistic> {
    return this.http.get<ShopStatistic>(`${this.API_URL}/statistic/shop`, {
      withCredentials: true,
      params: { shopId },
    });
  }
}
