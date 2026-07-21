import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductListQueryParams, ProductListResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  getProducts(query: ProductListQueryParams): Observable<ProductListResponse> {
    return this.http.get<ProductListResponse>(`${this.API_URL}/catalog/products`, {
      withCredentials: true,
      params: {
        page: query.page,
        limit: query.limit,
        shopId: query.shopId,
        ...(query.name ? { name: query.name } : {}),
        ...(query.sku ? { sku: query.sku } : {}),
        ...(query.categoryIds?.length ? { categoryIds: query.categoryIds.join(',') } : {}),
        ...(query.sortBy ? { sortBy: query.sortBy } : {}),
        ...(query.sortOrder ? { sortOrder: query.sortOrder } : {}),
      },
    });
  }
}
