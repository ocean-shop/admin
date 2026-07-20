import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateAttributePayload } from '../models/attribute-payload.model';
import {
  AttributeApiItem,
  AttributeListQueryParams,
  AttributeListResponse,
} from '../models/attribute.model';

@Injectable({
  providedIn: 'root',
})
export class AttributesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  getAttributes(query: AttributeListQueryParams): Observable<AttributeListResponse> {
    return this.http.get<AttributeListResponse>(`${this.API_URL}/catalog/attributes`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
        shopId: query.shopId,
        ...(query.name ? { name: query.name } : {}),
      },
    });
  }

  createAttribute(payload: CreateAttributePayload): Observable<AttributeApiItem> {
    return this.http.post<AttributeApiItem>(`${this.API_URL}/catalog/attributes`, payload, {
      withCredentials: true,
    });
  }

  deleteAttribute(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/catalog/attributes/${id}`, {
      withCredentials: true,
    });
  }
}
