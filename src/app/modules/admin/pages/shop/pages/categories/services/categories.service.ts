import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangeCategorySortPayload } from '../models/change-category-sort.model';
import { CategoriesApiResponse, CategoryApiItem } from '../models/category.model';
import { CreateCategoryPayload, UpdateCategoryPayload } from '../models/category-payload.model';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000';

  getCategories(): Observable<CategoriesApiResponse | CategoryApiItem[]> {
    return this.http.get<CategoriesApiResponse | CategoryApiItem[]>(
      `${this.API_URL}/catalog/categories`,
      {
        withCredentials: true,
      },
    );
  }

  getCategoryById(id: string): Observable<CategoryApiItem> {
    return this.http.get<CategoryApiItem>(`${this.API_URL}/catalog/categories/${id}`, {
      withCredentials: true,
    });
  }

  createCategory(payload: CreateCategoryPayload): Observable<CategoryApiItem> {
    return this.http.post<CategoryApiItem>(`${this.API_URL}/catalog/categories`, payload, {
      withCredentials: true,
    });
  }

  updateCategory(id: string, payload: UpdateCategoryPayload): Observable<CategoryApiItem> {
    return this.http.patch<CategoryApiItem>(`${this.API_URL}/catalog/categories/${id}`, payload, {
      withCredentials: true,
    });
  }

  changeCategorySort(id: string, payload: ChangeCategorySortPayload): Observable<CategoryApiItem> {
    return this.http.patch<CategoryApiItem>(
      `${this.API_URL}/catalog/categories/${id}/sort`,
      payload,
      {
        withCredentials: true,
      },
    );
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/catalog/categories/${id}`, {
      withCredentials: true,
    });
  }
}
