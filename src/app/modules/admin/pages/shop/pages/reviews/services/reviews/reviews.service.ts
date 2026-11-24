import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { ReviewListQueryParams, ReviewListResponse } from '../../models/review.model';

@Injectable({
  providedIn: 'root',
})
export class ReviewsService {
  private readonly http = inject(HttpClient);

  getReviews(query: ReviewListQueryParams): Observable<ReviewListResponse> {
    return this.http.get<ReviewListResponse>(`${API_URL}/catalog/product-reviews`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
        shopId: query.shopId,
        ...(query.status ? { status: query.status } : {}),
        ...(query.rating ? { rating: query.rating } : {}),
        ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
      },
    });
  }
}
