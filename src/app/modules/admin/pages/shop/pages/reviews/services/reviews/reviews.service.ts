import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import {
  ReviewApiItem,
  ReviewListQueryParams,
  ReviewListResponse,
} from '../../models/review.model';
import { UpdateReviewStatusPayload } from '../../models/update-review-status-payload.model';

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

  updateReviewStatus(id: string, payload: UpdateReviewStatusPayload): Observable<ReviewApiItem> {
    return this.http.patch<ReviewApiItem>(
      `${API_URL}/catalog/product-reviews/${id}/status`,
      payload,
      { withCredentials: true },
    );
  }
}
