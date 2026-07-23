import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateProductPayload } from '../models/create-product-payload.model';
import {
  ProductApiItem,
  ProductListQueryParams,
  ProductListResponse,
} from '../models/product.model';
import { ToggleProductAttributePayload } from '../models/toggle-product-attribute-payload.model';
import { ToggleProductCategoryPayload } from '../models/toggle-product-category-payload.model';
import { ToggleProductTagPayload } from '../models/toggle-product-tag-payload.model';
import { UpdateProductPayload } from '../models/update-product-payload.model';

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

  getProductById(id: string): Observable<ProductApiItem> {
    return this.http.get<ProductApiItem>(`${this.API_URL}/catalog/products/${id}`, {
      withCredentials: true,
    });
  }

  createProduct(payload: CreateProductPayload): Observable<ProductApiItem> {
    return this.http.post<ProductApiItem>(`${this.API_URL}/catalog/products`, payload, {
      withCredentials: true,
    });
  }

  updateProduct(id: string, payload: UpdateProductPayload): Observable<ProductApiItem> {
    return this.http.patch<ProductApiItem>(`${this.API_URL}/catalog/products/${id}`, payload, {
      withCredentials: true,
    });
  }

  assignCategory(productId: string, categoryId: string): Observable<void> {
    return this.toggleCategory(productId, { categoryId, assign: true });
  }

  toggleCategory(productId: string, payload: ToggleProductCategoryPayload): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/catalog/products/${productId}/categories`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  toggleAttribute(productId: string, payload: ToggleProductAttributePayload): Observable<void> {
    return this.http.post<void>(
      `${this.API_URL}/catalog/products/${productId}/attributes`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  toggleTag(productId: string, payload: ToggleProductTagPayload): Observable<void> {
    return this.http.post<void>(`${this.API_URL}/catalog/products/${productId}/tags`, payload, {
      withCredentials: true,
    });
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/catalog/products/${id}`, {
      withCredentials: true,
    });
  }
}
