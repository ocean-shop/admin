import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ChangeCategorySortPayload } from '../../models/change-category-sort.model';
import { CategoriesApiResponse, CategoryApiItem } from '../../models/category.model';
import { CreateCategoryPayload, UpdateCategoryPayload } from '../../models/category-payload.model';
import { API_URL } from '@core/constants/api.constant';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly http = inject(HttpClient);

  getCategories(shopId: string): Observable<CategoriesApiResponse | CategoryApiItem[]> {
    return this.http.get<CategoriesApiResponse | CategoryApiItem[]>(
      `${API_URL}/catalog/categories`,
      {
        params: { shopId },
        withCredentials: true,
      },
    );
  }

  getCategoryById(id: string): Observable<CategoryApiItem> {
    return this.http.get<CategoryApiItem>(`${API_URL}/catalog/categories/${id}`, {
      withCredentials: true,
    });
  }

  createCategory(payload: CreateCategoryPayload): Observable<CategoryApiItem> {
    return this.http.post<CategoryApiItem>(`${API_URL}/catalog/categories`, payload, {
      withCredentials: true,
    });
  }

  updateCategory(id: string, payload: UpdateCategoryPayload): Observable<CategoryApiItem> {
    return this.http.patch<CategoryApiItem>(`${API_URL}/catalog/categories/${id}`, payload, {
      withCredentials: true,
    });
  }

  changeCategorySort(id: string, payload: ChangeCategorySortPayload): Observable<CategoryApiItem> {
    return this.http.patch<CategoryApiItem>(`${API_URL}/catalog/categories/${id}/sort`, payload, {
      withCredentials: true,
    });
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/catalog/categories/${id}`, {
      withCredentials: true,
    });
  }
}
