import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_URL } from '@core/constants/api.constant';
import { CreateTagPayload } from '../models/tag-payload.model';
import { TagApiItem, TagListQueryParams, TagListResponse } from '../models/tag.model';

@Injectable({
  providedIn: 'root',
})
export class TagsService {
  private readonly http = inject(HttpClient);

  getTags(query: TagListQueryParams): Observable<TagListResponse> {
    return this.http.get<TagListResponse>(`${API_URL}/catalog/tags`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
        shopId: query.shopId,
        ...(query.name ? { name: query.name } : {}),
      },
    });
  }

  createTag(payload: CreateTagPayload): Observable<TagApiItem> {
    return this.http.post<TagApiItem>(`${API_URL}/catalog/tags`, payload, {
      withCredentials: true,
    });
  }

  deleteTag(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/catalog/tags/${id}`, {
      withCredentials: true,
    });
  }
}
